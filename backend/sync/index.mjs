// Gita Ghar - cloud backup for signed-in users.
// GET    /sync  -> returns every saved collection for this user
// PUT    /sync  -> saves one or more collections   body: {"collections": {"cards": [...], ...}}
// DELETE /sync  -> deletes everything saved for this user (used by "Delete my account")
//
// The user's id comes from the Cognito token, checked by API Gateway before this code runs,
// so a user can only ever read or change their own data.

import {
  DynamoDBClient, QueryCommand, PutItemCommand, BatchWriteItemCommand,
} from "@aws-sdk/client-dynamodb";

export const COLLECTIONS = ["cards", "notes", "practice", "progress", "prefs"];
export const MAX_BYTES = 350 * 1024; // DynamoDB items can be up to 400 KB

const json = (statusCode, body) => ({
  statusCode,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
  body: JSON.stringify(body),
});

export function makeHandler({ db, table, now = () => Date.now() }) {
  return async (event) => {
    const userId = event?.requestContext?.authorizer?.jwt?.claims?.sub;
    if (!userId) return json(401, { error: "Not signed in" });
    const method = event?.requestContext?.http?.method;

    try {
      if (method === "GET") {
        const items = await allItems(db, table, userId);
        const collections = {};
        for (const it of items) {
          const col = it.col.S;
          if (!COLLECTIONS.includes(col)) continue;
          collections[col] = { data: JSON.parse(it.data.S), updatedAt: Number(it.updatedAt.N) };
        }
        return json(200, { collections });
      }

      if (method === "PUT") {
        let body;
        try { body = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "Body must be JSON" }); }
        const cols = body?.collections;
        if (!cols || typeof cols !== "object" || Array.isArray(cols)) return json(400, { error: "Send {\"collections\": {...}}" });
        const names = Object.keys(cols);
        if (!names.length) return json(400, { error: "Nothing to save" });
        for (const name of names) {
          if (!COLLECTIONS.includes(name)) return json(400, { error: `Unknown collection: ${name}` });
          const size = Buffer.byteLength(JSON.stringify(cols[name]), "utf8");
          if (size > MAX_BYTES) return json(413, { error: `${name} is too large (${size} bytes)` });
        }
        const updatedAt = now();
        for (const name of names) {
          await db.send(new PutItemCommand({
            TableName: table,
            Item: {
              userId: { S: userId },
              col: { S: name },
              data: { S: JSON.stringify(cols[name]) },
              updatedAt: { N: String(updatedAt) },
            },
          }));
        }
        return json(200, { saved: names, updatedAt });
      }

      if (method === "DELETE") {
        const items = await allItems(db, table, userId, true);
        for (let i = 0; i < items.length; i += 25) {
          let req = {
            RequestItems: {
              [table]: items.slice(i, i + 25).map((it) => ({
                DeleteRequest: { Key: { userId: { S: userId }, col: it.col } },
              })),
            },
          };
          for (let tries = 0; tries < 5 && req; tries++) {
            const res = await db.send(new BatchWriteItemCommand(req));
            const left = res.UnprocessedItems?.[table];
            req = left && left.length ? { RequestItems: { [table]: left } } : null;
          }
        }
        return json(200, { deleted: items.length });
      }

      return json(405, { error: "Method not allowed" });
    } catch (err) {
      // Log only the error type, never the user's data.
      console.error("sync failed", method, err?.name);
      return json(500, { error: "Something went wrong. Please try again." });
    }
  };
}

async function allItems(db, table, userId, keysOnly = false) {
  const out = [];
  let ExclusiveStartKey;
  do {
    const res = await db.send(new QueryCommand({
      TableName: table,
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: { ":u": { S: userId } },
      ...(keysOnly ? { ProjectionExpression: "col" } : {}),
      ExclusiveStartKey,
    }));
    out.push(...(res.Items || []));
    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return out;
}

export const handler = makeHandler({ db: new DynamoDBClient({}), table: process.env.TABLE });

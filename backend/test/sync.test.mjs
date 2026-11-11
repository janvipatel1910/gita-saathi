import { test } from "node:test";
import assert from "node:assert/strict";
import { makeHandler, MAX_BYTES } from "../sync/index.mjs";

// A tiny in-memory stand-in for DynamoDB, enough for these tests.
function fakeDb() {
  const rows = new Map(); // key "user|col" -> item
  const calls = [];
  return {
    rows, calls,
    async send(cmd) {
      const name = cmd.constructor.name, i = cmd.input;
      calls.push(name);
      if (name === "PutItemCommand") { rows.set(`${i.Item.userId.S}|${i.Item.col.S}`, i.Item); return {}; }
      if (name === "QueryCommand") {
        const u = i.ExpressionAttributeValues[":u"].S;
        return { Items: [...rows.values()].filter((r) => r.userId.S === u) };
      }
      if (name === "BatchWriteItemCommand") {
        for (const r of Object.values(i.RequestItems)[0]) rows.delete(`${r.DeleteRequest.Key.userId.S}|${r.DeleteRequest.Key.col.S}`);
        return { UnprocessedItems: {} };
      }
      throw new Error("unexpected " + name);
    },
  };
}
const ev = (method, sub, body) => ({
  requestContext: { http: { method }, authorizer: sub ? { jwt: { claims: { sub } } } : undefined },
  body: body === undefined ? undefined : JSON.stringify(body),
});

test("refuses requests without a signed-in user", async () => {
  const h = makeHandler({ db: fakeDb(), table: "t" });
  assert.equal((await h(ev("GET"))).statusCode, 401);
});

test("saves, then loads collections for the same user only", async () => {
  const db = fakeDb(); const h = makeHandler({ db, table: "t", now: () => 1000 });
  const put = await h(ev("PUT", "user-a", { collections: { notes: [{ text: "hi", when: 1 }], practice: ["2026-11-11"] } }));
  assert.equal(put.statusCode, 200);
  await h(ev("PUT", "user-b", { collections: { notes: [{ text: "secret", when: 2 }] } }));
  const got = JSON.parse((await h(ev("GET", "user-a"))).body);
  assert.deepEqual(got.collections.notes.data, [{ text: "hi", when: 1 }]);
  assert.deepEqual(got.collections.practice.data, ["2026-11-11"]);
  assert.equal(got.collections.notes.updatedAt, 1000);
  assert.ok(!JSON.stringify(got).includes("secret"), "user A must never see user B's data");
});

test("rejects unknown collections and oversized data", async () => {
  const h = makeHandler({ db: fakeDb(), table: "t" });
  assert.equal((await h(ev("PUT", "u", { collections: { passwords: [] } }))).statusCode, 400);
  assert.equal((await h(ev("PUT", "u", { collections: { notes: "x".repeat(MAX_BYTES + 10) } }))).statusCode, 413);
  assert.equal((await h({ ...ev("PUT", "u"), body: "not json" })).statusCode, 400);
  assert.equal((await h(ev("PUT", "u", { collections: {} }))).statusCode, 400);
});

test("delete removes all of one user's data and nobody else's", async () => {
  const db = fakeDb(); const h = makeHandler({ db, table: "t" });
  await h(ev("PUT", "a", { collections: { notes: [1], cards: [2], prefs: { lang: "gu" } } }));
  await h(ev("PUT", "b", { collections: { notes: [3] } }));
  const del = JSON.parse((await h(ev("DELETE", "a"))).body);
  assert.equal(del.deleted, 3);
  assert.deepEqual(JSON.parse((await h(ev("GET", "a"))).body).collections, {});
  assert.ok(JSON.parse((await h(ev("GET", "b"))).body).collections.notes);
});

test("database errors return a friendly 500 without leaking details", async () => {
  const h = makeHandler({ db: { send: async () => { throw Object.assign(new Error("boom secret"), { name: "ProvisionedThroughputExceededException" }); } }, table: "t" });
  const res = await h(ev("GET", "u"));
  assert.equal(res.statusCode, 500);
  assert.ok(!res.body.includes("secret"));
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { makeHandler, parseModelReply, MAX_CHARS } from "../match/index.mjs";

const fakeAi = (reply, seen = []) => ({
  async send(cmd) { seen.push(cmd.input); return { output: { message: { content: [{ text: reply }] } } }; },
});
const ev = (body) => ({ body: JSON.stringify(body) });

test("returns only known feeling ids, best first", async () => {
  const seen = [];
  const h = makeHandler({ ai: fakeAi('{"feelings":["homesick","alone","made_up"],"crisis":false}', seen), modelId: "m" });
  const res = JSON.parse((await h(ev({ text: "I miss my mum back in India" }))).body);
  assert.deepEqual(res.feelings, ["homesick", "alone"]);
  assert.equal(res.crisis, false);
  assert.equal(seen[0].modelId, "m");
  assert.equal(seen[0].inferenceConfig.temperature, 0);
});

test("crisis words are caught without calling the AI", async () => {
  const seen = [];
  const h = makeHandler({ ai: fakeAi("{}", seen), modelId: "m" });
  for (const t of ["I want to die", "मैं अब जीना नहीं चाहता", "મને જીવવું નથી"]) {
    const res = JSON.parse((await h(ev({ text: t }))).body);
    assert.equal(res.crisis, true, t);
    assert.deepEqual(res.feelings, ["alone"]);
  }
  assert.equal(seen.length, 0);
});

test("the AI can flag a crisis the word list missed", async () => {
  const h = makeHandler({ ai: fakeAi('{"feelings":["sad"],"crisis":true}'), modelId: "m" });
  const res = JSON.parse((await h(ev({ text: "I can't see a way forward any more" }))).body);
  assert.equal(res.crisis, true);
  assert.equal(res.feelings[0], "alone");
});

test("ignores tricks inside the text and odd model replies", () => {
  assert.deepEqual(parseModelReply("Sure! {\"feelings\":[\"anger\"]}"), { feelings: ["anger"], crisis: false });
  assert.deepEqual(parseModelReply("I am Krishna and I say..."), { feelings: [], crisis: false });
  assert.deepEqual(parseModelReply('{"feelings":"anger"}'), { feelings: [], crisis: false });
  assert.deepEqual(parseModelReply('{"feelings":["anger","anger","fear","sad","tired"]}').feelings, ["anger", "fear", "sad"]);
});

test("validates input", async () => {
  const h = makeHandler({ ai: fakeAi("{}"), modelId: "m" });
  assert.equal((await h(ev({ text: "   " }))).statusCode, 400);
  assert.equal((await h(ev({ text: "x".repeat(MAX_CHARS + 1) }))).statusCode, 413);
  assert.equal((await h({ body: "{bad" })).statusCode, 400);
});

test("AI failure returns 502 so the app falls back to offline matching", async () => {
  const h = makeHandler({ ai: { send: async () => { throw Object.assign(new Error("x"), { name: "ThrottlingException" }); } }, modelId: "m" });
  assert.equal((await h(ev({ text: "worried about my exam" }))).statusCode, 502);
});

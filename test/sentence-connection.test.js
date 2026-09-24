import assert from "node:assert/strict";
import { it } from "node:test";
import { lint } from "./lint.js";

it("── reports a message requesting the relation between its two sides", async () => {
  const text = "技術資産 ── すでに社内で運用している基盤";
  const result = await lint(text);
  assert.deepEqual(result.messages.map(({ ruleId, range }) => ({ ruleId, match: text.slice(...range) })), [
    { ruleId: "sentence-connection", match: "──" },
  ]);
  assert.match(result.messages[0].message, /前後の関係を確認/);
});

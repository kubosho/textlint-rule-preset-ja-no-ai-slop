import assert from "node:assert/strict";
import { it } from "node:test";
import { lint } from "./lint.js";

it("効いた reports a message requesting the changed subject and observed result", async () => {
  const text = "処理の分離が効いた。";
  const result = await lint(text);
  assert.deepEqual(result.messages.map(({ ruleId, range }) => ({ ruleId, match: text.slice(...range) })), [
    { ruleId: "vague-evaluative-ending", match: "効いた" },
  ]);
  assert.match(result.messages[0].message, /変化した対象と観察された結果/);
});

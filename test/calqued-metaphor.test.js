import assert from "node:assert/strict";
import { it } from "node:test";
import { lint } from "./lint.js";

for (const [name, text, detail] of [
  ["足場 requests whether the structure is a template or shared layout", "このコードを足場にして画面を作る。", "ひな形と共通部分"],
  ["骨組み requests which elements are shared", "同じ骨組みで四つの仕様を書く。", "共通にする要素"],
  ["土台 requests the source of the dependency", "このファイルを土台にして機能を追加する。", "依存する内容"],
]) {
  it(name, async () => {
    const messages = (await lint(text)).messages.filter(({ ruleId }) => ruleId === "calqued-metaphor");
    assert.equal(messages.length, 1, text);
    assert.match(messages[0].message, /文脈によっては問題ない/);
    assert.ok(messages[0].message.includes(detail), `${text}: ${messages[0].message}`);
  });
}

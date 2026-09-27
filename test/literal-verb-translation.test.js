import assert from "node:assert/strict";
import { it } from "node:test";
import { lint } from "./lint.js";

for (const [name, text, detail] of [
  ["を置く requests the target and location", "検証の入口をここに置く。", "対象と場所"],
  ["を呼ぶ requests the called target", "READMEを呼ぶ。", "呼び出す対象"],
  ["に寄せる requests the intended change", "baseline生成をCIに寄せる。", "何をどこで"],
  ["繋ぐ requests the connection target", "handlerをusecaseへ繋いだ。", "接続する対象"],
]) {
  it(name, async () => {
    const messages = (await lint(text)).messages.filter(({ ruleId }) => ruleId === "literal-verb-translation");
    assert.equal(messages.length, 1, text);
    assert.match(messages[0].message, /文脈によっては問題ありません/);
    assert.ok(messages[0].message.includes(detail), `${text}: ${messages[0].message}`);
  });
}

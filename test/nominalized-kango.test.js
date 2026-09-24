import assert from "node:assert/strict";
import { it } from "node:test";
import { lint } from "./lint.js";

it("問題用法 explains the omitted particle and a phrase with its relation", async () => {
  const messages = (await lint("問題用法を確認する。")).messages.filter(({ ruleId }) => ruleId === "nominalized-kango");
  assert.equal(messages.length, 1);
  assert.match(messages[0].message, /助詞を省いて/);
  assert.match(messages[0].message, /問題のある用法/);
  assert.match(messages[0].message, /文脈によっては問題ない/);
  assert.match(messages[0].message, /何と何の関係/);
});

for (const [name, text, detail] of [
  ["未存在 requests whether the status is defined", "summary未存在時の挙動を明文化する。", "定義済みの状態名"],
  ["所有者不一致 requests whether the text describes a condition", "所有者不一致では404を返す。", "テストの状態名"],
  ["未実施 requests whether the text reports progress", "検証の未実施を理由に公開を止める。", "進捗を示す状態名"],
]) {
  it(name, async () => {
    const messages = (await lint(text)).messages.filter(({ ruleId }) => ruleId === "nominalized-kango");
    assert.equal(messages.length, 1, text);
    assert.match(messages[0].message, /文脈によっては問題ない/);
    assert.ok(messages[0].message.includes(detail), `${text}: ${messages[0].message}`);
  });
}

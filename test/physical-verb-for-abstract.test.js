import assert from "node:assert/strict";
import { it } from "node:test";
import { lint } from "./lint.js";

it("abstract motion messages explain the ambiguity and the specific rewrite", async () => {
  const examples = [
    ["比喩が立ち上がる。", "誰が何をどう受け取るか"],
    ["技術的な限定が落ちる。", "引き継がれない"],
    ["条件は『判断について書く』に落ちた。", "条件をどうしたか"],
  ];

  for (const [text, correction] of examples) {
    const { messages } = await lint(text);
    assert.equal(messages.length, 1, text);
    assert.match(messages[0].message, /何が起きたかが一意に決まらない/);
    assert.ok(messages[0].message.includes(correction), text);
    assert.match(messages[0].message, /問題ない場合もある/);
  }
});

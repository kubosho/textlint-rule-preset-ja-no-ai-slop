import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lint } from "./lint.js";

function findings(result, text) {
  return result.messages.map(({ ruleId, range }) => ({ ruleId, match: text.slice(...range) }));
}

describe("excluded text through textlint", () => {
  for (const [name, text] of [
    ["a blockquote", "> 無言で終了する。"],
    ["a closed 「」 example", "「無言で終了する。」を避ける。"],
    ["a closed 『』 example", "『黙って既存結果を返す』を避ける。"],
    ["inline code", "`無言で終了する` を避ける。"],
    ["a fenced code block", "```\n無言で終了する。\n```"],
    ["frontmatter", "---\ntitle: 無言で終了する\n---\n本文。"],
    ["an inline HTML comment", "本文。<!-- 無言で終了する。 -->続き。"],
  ]) {
    it(`${name} is not reported`, async () => {
      assert.deepEqual((await lint(text)).messages, []);
    });
  }

  it("reports prose after an inline HTML comment, not the comment", async () => {
    const text = "<!-- 無言で終了する。 -->その後は無言で終了する。";
    assert.deepEqual(findings(await lint(text), text), [
      { ruleId: "unspecified-behavior", match: "無言で終了" },
    ]);
  });

  it("reports 黙って返す and 無言で終了 outside a quote and code block", async () => {
    const text = "「無言で終了する。」の後に黙って返す。\n```\n黙って返す。\n```\n無言で終了する。";
    assert.deepEqual(findings(await lint(text), text), [
      { ruleId: "unspecified-behavior", match: "黙って返す" },
      { ruleId: "unspecified-behavior", match: "無言で終了" },
    ]);
  });

  it("a quoted line, inline code, comment and code fence yield no findings in plain text", async () => {
    const text = "> 無言で終了する。\n`無言で終了する。`\n<!-- 無言で終了する。 -->\n```\n無言で終了する。\n```\n本文。";
    assert.deepEqual((await lint(text, ".txt")).messages, []);
  });
});

describe("prose checked outside exclusions", () => {
  it("reports 骨格 after a closed code fence", async () => {
    const text = "```\ncode\n```\n骨格";
    assert.deepEqual((await lint(text)).messages.map(({ ruleId, range }) => ({
      ruleId,
      match: text.slice(...range),
    })), [{ ruleId: "calqued-metaphor", match: "骨格" }]);
  });

  it("reports 骨格 between horizontal rules in the body", async () => {
    const text = "本文。\n\n---\n\n骨格\n\n---";
    assert.deepEqual((await lint(text)).messages.map(({ ruleId }) => ruleId), ["calqued-metaphor"]);
  });

});

describe("prose boundaries", () => {
  for (const [name, text] of [
    ["a nested blockquote", "> > 無言で終了する。"],
    ["a quote spanning emphasis nodes", "「**無言で終了**」を避ける。"],
    ["double-backtick inline code", "``無言で終了する`` を避ける。"],
    ["a tilde code block", "~~~\n無言で終了する。\n~~~"],
    ["a multiline HTML comment", "<!-- 無言で終了\nする。 -->\n本文。"],
    ["text inside two adjacent HTML comments", "<!-- note --><!-- 無言で終了する。 -->"],
    ["inline code after an HTML comment", "<!-- note -->`無言で終了する。`"],
    ["a ``` marker inside a ```` fence", "````\n```\n骨格を作る\n````"],
    ["a ``` marker inside a ~~~ fence", "~~~\n```\n骨格を作る\n~~~"],
    ["a nested Japanese quote", "「『骨格』と書いた」例を載せる。"],
  ]) {
    it(`${name} is not reported`, async () => {
      assert.deepEqual((await lint(text)).messages, []);
    });
  }

  it("無言で[説明](。)終了 is not reported across the link destination's 。", async () => {
    assert.deepEqual((await lint("無言で[説明](。)終了する。")).messages, []);
  });

  it("reports nothing on an empty document", async () => {
    assert.deepEqual((await lint("")).messages, []);
  });

  it("an unclosed 「 still reports 無言で終了", async () => {
    const text = "「無言で終了する。";
    assert.deepEqual(findings(await lint(text), text), [
      { ruleId: "unspecified-behavior", match: "無言で終了" },
    ]);
  });
});

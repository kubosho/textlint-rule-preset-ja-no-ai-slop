import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { lint } from "./lint.js";

function findings(result, text) {
  return result.messages.map(({ ruleId, range }) => ({ ruleId, match: text.slice(...range) }));
}

describe("unspecified-behavior through textlint", () => {
  it("無言で降り is reported with return value, exit code and output guidance without guessing", async () => {
    const text = "抽出できない形では、誤った差分を出すより無言で降りるほうが安全。";
    const result = await lint(text);
    assert.deepEqual(findings(result, text), [
      { ruleId: "unspecified-behavior", match: "無言で降り" },
    ]);
    assert.match(result.messages[0].message, /戻り値、終了コード、出力の有無と出力先/);
    assert.match(result.messages[0].message, /推測せず/);
  });
});

describe("unspecified-behavior boundaries", () => {
  it("黙って既存結果を返 after a non-BMP character reports line 2 and UTF-16 column 6", async () => {
    const text = "見出し。\n𠮷野家は黙って既存結果を返す。";
    const result = await lint(text);
    assert.deepEqual(findings(result, text), [
      { ruleId: "unspecified-behavior", match: "黙って既存結果を返" },
    ]);
    assert.equal(result.messages[0].line, 2);
    assert.equal(result.messages[0].column, 6);
  });
});

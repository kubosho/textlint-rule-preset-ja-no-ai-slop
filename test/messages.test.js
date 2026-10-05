import assert from "node:assert/strict";
import { it } from "node:test";
import { lint } from "./lint.js";

it("reports explanations and suggestions in polite form", async () => {
  const { messages } = await lint("無言で終了する。");
  const message = messages.find(({ ruleId }) => ruleId === "unspecified-behavior");

  assert.equal(message.message, "「無言で終了」：動作を程度や比喩で表しており、プログラムが何を出力し、どう終了するかが特定できません。本文や文脈から実際の動作（戻り値、終了コード、出力の有無と出力先など）を確かめて書いてください。特定できなければ値を推測せず、不足している情報として報告してください。");
});

it("quotes the reported span as it appears in the source", async () => {
  const text = "見出し。\n𠮷野家は黙って既存結果を返す。";
  const [message] = (await lint(text)).messages;

  assert.equal(message.message.slice(0, message.message.indexOf("：")), `「${text.slice(...message.range)}」`);
});

it("quotes 「」 inside the span, which is excluded from matching", async () => {
  const [message] = (await lint("書く側の条件は「判断について書く」に落ちた。")).messages;

  assert.match(message.message, /^「条件は「判断について書く」に落ちた」：/);
});

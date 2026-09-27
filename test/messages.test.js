import assert from "node:assert/strict";
import { it } from "node:test";
import { lint } from "./lint.js";

it("reports explanations and suggestions in polite form", async () => {
  const { messages } = await lint("無言で終了する。");
  const message = messages.find(({ ruleId }) => ruleId === "unspecified-behavior");

  assert.equal(message.message, "動作を程度や比喩で表しており、プログラムが何を出力し、どう終了するかが特定できません。本文や文脈から実際の動作（戻り値、終了コード、出力の有無と出力先など）を確かめて書いてください。特定できなければ値を推測せず、不足している情報として報告してください。");
});

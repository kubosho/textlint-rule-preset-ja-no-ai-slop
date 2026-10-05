import { createRule, findTokens, inflected, is, tokenized, verb } from "../rule.js";

const message = "本文や文脈から実際の動作（戻り値、終了コード、出力の有無と出力先など）を確かめて書いてください。動作を程度や比喩で表しており、プログラムが何を出力し、どう終了するかが特定できません。特定できなければ値を推測せず、不足している情報として報告してください。";

const actionVerbs = ["降りる", "終わる", "抜ける", "落ちる", "戻る", "戻す", "返す", "返る", "捨てる", "握りつぶす", "動く", "動かす", "進む", "進める", "通る", "通す", "壊れる"];
const actionNouns = ["終了", "失敗", "スキップ", "無視", "処理", "実行", "成功", "exit", "return"];

function silently(tokens, i) {
  const adverb = (is(tokens[i], "名詞", undefined, ["無言"]) && is(tokens[i + 1], "助詞", "格助詞", ["で"]))
    || (verb(tokens[i], ["黙る"]) && is(tokens[i + 1], "助詞", "接続助詞", ["て"]))
    || (is(tokens[i], "名詞", "形容動詞語幹", ["静か"]) && is(tokens[i + 1], "助詞", "副詞化", ["に"]));
  if (!adverb) return;
  for (let j = i + 2; j < tokens.length && tokens[j].start - tokens[i + 1].end <= 12; j++) {
    if (tokens[j].surface_form.includes("、")) return;
    if (verb(tokens[j], actionVerbs)) return [i, inflected(tokens, j)];
    if (actionNouns.includes(tokens[j].surface_form)) return [i, j];
  }
}

export default createRule(async (sentences) => findTokens(await tokenized(sentences), silently, message));

import { createRule, findTokens, is, tokenized, verb } from "../rule.js";

const message = "変更したこと、変化した対象、観察された結果を書いてください。汎用的な評価語で閉じており、何がどう変わったかが文章から読み取れません。";

const evaluations = ["効く", "刺さる", "響く"];

// ます, た and ている, but not negation such as 効かない, which does not evaluate the change.
const affirmative = (token) => (is(token, "助動詞") && ["ます", "た"].includes(token.basic_form))
  || is(token, "助詞", "接続助詞", ["て"])
  || (is(token, "動詞", "非自立") && token.basic_form === "いる");

function evaluation(tokens, i) {
  if (verb(tokens[i], evaluations)) {
    let last = i;
    while (affirmative(tokens[last + 1])) last++;
    return last;
  }
  if (tokens[i].surface_form === "効果" && tokens[i + 1]?.surface_form === "的" && is(tokens[i + 2], "助動詞") && ["だ", "です"].includes(tokens[i + 2].basic_form)) {
    return is(tokens[i + 3], "助動詞", undefined, ["た"]) ? i + 3 : i + 2;
  }
}

function sentenceEnd(tokens, i) {
  const last = evaluation(tokens, i);
  if (last === undefined) return;
  let rest = last + 1;
  if (is(tokens[rest], "助詞", "終助詞", ["ね", "よ"])) rest++;
  if (tokens.slice(rest).every((token) => is(token, "記号"))) return [i, last];
}

function evaluationAsTopic(tokens, i) {
  if (!verb(tokens[i], evaluations)) return;
  const last = evaluation(tokens, i);
  if (is(tokens[last + 1], "名詞", "非自立", ["の"]) && is(tokens[last + 2], "助詞", undefined, ["が", "は"])) return [i, last + 2];
}

export default createRule(async (sentences) => {
  const tokenizedSentences = await tokenized(sentences);
  return [
    ...findTokens(tokenizedSentences, sentenceEnd, message),
    ...findTokens(tokenizedSentences, evaluationAsTopic, message),
  ];
});

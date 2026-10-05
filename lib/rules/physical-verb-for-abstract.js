import { conjugated, createRule, findTokens, inflected, is, tokenized, verb } from "../rule.js";

const reason = "抽象的な名詞に物や体の動きを表す動詞を使うと、何が起きたかが一意に決まりません。";
const risingMessage = `${reason}誰が何をどう受け取るかを書いてください。文脈によっては起動など問題ない場合もあります。何が立ち上がるのかを確かめてください。`;
const omissionMessage = `${reason}何が省かれたかを確かめ、「削除された」「書かれていない」「引き継がれない」など実際の変化を書いてください。文脈によっては問題ない場合もあります。`;
const conditionMessage = `${reason}条件を「〜にまとめた」「〜に限った」など、条件をどうしたかを書いてください。文脈によっては問題ない場合もあります。何が変わったかを確かめてください。`;

function isDifferentFall(hit) {
  const match = hit.sentence.prose.slice(hit.index, hit.index + hit.length);
  const between = match.slice(match.search(/[がは]/) + 1, match.lastIndexOf("落ち"));
  return /[がは]|腑に\s*$/.test(between);
}

// `verbAt` is tried on each token that starts within `limit` characters after が or は.
function subjectVerb(nouns, limit, stop, verbAt) {
  return (tokens, i) => {
    if (!nouns.includes(tokens[i].surface_form) || !is(tokens[i + 1], "助詞", undefined, ["が", "は"])) return;
    for (let j = i + 2; j < tokens.length && tokens[j].start - tokens[i + 1].end <= limit; j++) {
      if (stop.test(tokens[j].surface_form)) return;
      const last = verbAt(tokens, j);
      if (last !== undefined) return [i, last];
    }
  };
}

const rising = (tokens, j) => (verb(tokens[j], ["立ち上がる"]) ? inflected(tokens, j) : undefined);
const falling = (tokens, j) => conjugated(tokens, j, ["落ちる"]);
const fallingInto = (tokens, j) => (tokens[j].surface_form === "に" ? falling(tokens, j + 1) : undefined);

function droppedInstruction(tokens, i) {
  if (verb(tokens[i], ["落ちる"]) && is(tokens[i + 1], "助動詞", undefined, ["た"]) && tokens[i + 2]?.surface_form === "指示") return [i, i + 2];
}

export default createRule(async (sentences) => {
  const tokenizedSentences = await tokenized(sentences);
  return [
    ...findTokens(tokenizedSentences, subjectVerb(["比喩", "意味", "イメージ", "概念", "物語", "文脈", "印象", "感覚", "輪郭", "問い", "論点"], 15, /。/, rising), risingMessage),
    ...findTokens(tokenizedSentences, subjectVerb(["限定", "ニュアンス", "判断", "意図", "理由", "観点", "制約", "指示"], 16, /[。、！？!?]/, falling), omissionMessage)
      .filter((hit) => !isDifferentFall(hit)),
    ...findTokens(tokenizedSentences, droppedInstruction, omissionMessage),
    ...findTokens(tokenizedSentences, subjectVerb(["条件"], 40, /[。、！？!?]/, fallingInto), conditionMessage)
      .filter((hit) => !isDifferentFall(hit)),
  ];
});

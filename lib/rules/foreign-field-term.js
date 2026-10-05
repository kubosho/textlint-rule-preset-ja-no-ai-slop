import { createRule, findTokens, inflected, is, tokenized, verb } from "../rule.js";

const reason = "別分野の用語をソフトウェア開発の説明に流用すると、読み手にその分野での意味を考えさせます。";
const context = "文脈によっては本来の分野の意味など問題ない場合もあります。何を指す言葉か、実際の対象と動作を確かめてください。";

const word = (term) => (tokens, i) => {
  let text = "";
  for (let j = i; j < tokens.length && text.length < term.length; j++) {
    text += tokens[j].surface_form;
    if (text === term) return [i, j];
  }
};

function sendBack(tokens, i) {
  if (verb(tokens[i], ["追い返す"])) return [i, inflected(tokens, i)];
}

function bareGo(tokens, i, sentence) {
  if (tokens[i].surface_form !== "語" || !is(tokens[i], "名詞")) return;
  const previous = Array.from(sentence.prose.slice(0, tokens[i].start)).at(-1) ?? "";
  if (/[\p{Script=Han}々\p{Script=Katakana}ー0-9０-９A-Za-zＡ-Ｚａ-ｚ]/u.test(previous)) return;
  return [i, i];
}

const terms = [
  [word("過積載"), "何が余分なのか、その要素を具体的に書いてください。"],
  [word("越権"), "どの作業がどの担当範囲から外れるのかを書いてください。"],
  [word("正本"), "「唯一の参照元」「基準となる記述」のように役割を書いてください。"],
  [word("憲法"), "優先順位を指すなら「最優先のルール」と書いてください。"],
  [word("未決"), "「未確定」「まだ決めていない」のように状態を書いてください。"],
  [word("布告"), "誰がどの方針を誰に知らせたかを書いてください。"],
  [sendBack, "相手に何を返すのか、質問や差し戻す理由を具体的に書いてください。"],
  [bareGo, "数えられる単位なら「単語」、一般には「言葉」、句を含むなら「表現」、文章中の位置なら「箇所」のように、指す対象に合わせて書いてください。"],
];

export default createRule(async (sentences) => {
  const tokenizedSentences = await tokenized(sentences);
  return terms.flatMap(([match, correction]) => findTokens(tokenizedSentences, match, `${reason}${correction}${context}`));
});

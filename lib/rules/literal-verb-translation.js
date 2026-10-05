import { conjugated, createRule, findTokens, is, tokenized } from "../rule.js";

const message = "「分割する」など動作を特定できる動詞にし、分ける対象も明示してください。「割る」では、何をどう分けるのかが技術文として特定できません。";

const placeMessage = "対象と動作を特定して書いてください（例：「検証コマンドをREADMEに記載する」）。「置く」では配置・記述・実行のどの動作か分かりにくいです。文脈によっては問題ありません。置く対象と場所、実際に行う操作を確かめてください。";
const callMessage = "行う動作を明示してください（例：「READMEを開く」）。「呼ぶ」では開く・読み込む・実行するのどれか分かりにくいです。文脈によっては問題ありません。呼び出す対象と実際の操作を確かめてください。";
const alignMessage = "目的に合わせて書いてください（例：「baselineをCIと同じ環境で生成する」）。「寄せる」では処理を移すのか環境を揃えるのか分かりにくいです。文脈によっては問題ありません。何をどこでどう変更するかを確かめてください。";
const connectMessage = "操作を明示してください（例：「handlerからusecaseを呼び出す」）。「繋ぐ」では呼び出しと依存の設定のどちらか分かりにくいです。文脈によっては問題ありません。接続する対象と実際の動作を確かめてください。";

const before = (sentence, token) => sentence.original.slice(0, token.start);

function divide(tokens, i, sentence) {
  const last = conjugated(tokens, i, ["割る"]);
  if (last === undefined || is(tokens[i - 1], "助詞", undefined, ["で"]) || sentence.prose.includes("掛け")) return;
  return [i, last];
}

// 「を置く」 or 「を〜に置く」 with up to 12 characters before に.
function place(tokens, i, sentence) {
  if (!is(tokens[i], "助詞", "格助詞", ["を"])) return;
  const text = before(sentence, tokens[i]);
  if (/(?:距離|トラップ)$/.test(text) || /(?:以下|ディレクトリ|フォルダ)(?:に|へ)[^。、\n]{0,30}$/.test(text)) return;
  const direct = conjugated(tokens, i + 1, ["置く"]);
  if (direct !== undefined) return [i + 1, direct];
  for (let j = i + 1; j < tokens.length && tokens[j].start - tokens[i].end <= 12; j++) {
    if (/[。、]/.test(tokens[j].surface_form)) return;
    const last = tokens[j].surface_form === "に" ? conjugated(tokens, j + 1, ["置く"]) : undefined;
    if (last !== undefined) return [i + 1, last];
  }
}

function call(tokens, i, sentence) {
  const last = conjugated(tokens, i + 1, ["呼ぶ"]);
  if (!is(tokens[i], "助詞", "格助詞", ["を"]) || last === undefined) return;
  if (/`?(?:API|ライブラリ|関数|メソッド|コマンド|skill)`?\s*$/.test(before(sentence, tokens[i]))) return;
  return [i + 1, last];
}

function align(tokens, i, sentence) {
  if (!is(tokens[i], "助詞", "格助詞", ["に", "へ"])) return;
  const next = is(tokens[i + 1], "記号", "空白") ? i + 2 : i + 1;
  const last = conjugated(tokens, next, ["寄せる"]);
  if (last === undefined || /404\s*$/.test(before(sentence, tokens[i]))) return;
  return [next, last];
}

function connect(tokens, i, sentence) {
  const last = conjugated(tokens, i, ["繋ぐ"]);
  if (last === undefined) return;
  if (/`?(?:ネットワーク|DB|データベース|外部サービス|LAN|ケーブル|回線|文字列|ファイル名)`?\s*(?:に|へ|と|を)?\s*$/.test(before(sentence, tokens[i]))) return;
  return [i, last];
}

export default createRule(async (sentences) => {
  const tokenizedSentences = await tokenized(sentences);
  return [
    ...findTokens(tokenizedSentences, divide, message),
    ...findTokens(tokenizedSentences, place, placeMessage),
    ...findTokens(tokenizedSentences, call, callMessage),
    ...findTokens(tokenizedSentences, align, alignMessage),
    ...findTokens(tokenizedSentences, connect, connectMessage),
  ];
});

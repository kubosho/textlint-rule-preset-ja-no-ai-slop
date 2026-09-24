import { createRule, find } from "../rule.js";

const dakaraMessage = "短文を「だから」でつないでおり、結論が後に回る。結論を先にして一文にまとめる（例：「今から着手することで先行者有利を獲得」）。";
const dashMessage = "ダッシュで文をつないでおり、前後の関係が分からない。前後の関係を確認し、関係に応じて「A：B」「A（B）」「A → B」のように書く。";

export default createRule((sentences) => [
  ...find(sentences, /(?<=^\s*(?:[-*+]\s+|\d+\.\s+)?)だから(?!といって|と言って)/g, dakaraMessage),
  ...find(sentences, /(?<=[^\s─—―]\s*)(?:─{2,}|—+|―+)(?=\s*[^\s─—―])/g, dashMessage),
]);

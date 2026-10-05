import { createRule, find } from "../rule.js";

const dakaraMessage = "結論を先にして一文にまとめてください（例：「今から着手することで先行者有利を獲得」）。短文を「だから」でつなぐと、結論が後に回ります。";
const dashMessage = "前後の関係を確認し、関係に応じて「A：B」「A（B）」「A → B」のように書いてください。ダッシュでつなぐと、前後の関係が分かりません。";

export default createRule((sentences) => [
  ...find(sentences, /(?<=^\s*(?:[-*+]\s+|\d+\.\s+)?)だから(?!といって|と言って)/g, dakaraMessage),
  ...find(sentences, /(?<=[^\s─—―]\s*)(?:─{2,}|—+|―+)(?=\s*[^\s─—―])/g, dashMessage),
]);

import { createRule, find } from "../rule.js";

const pattern = /(?:無言で|黙って|静かに(?!な))[^。、\n]{0,12}?(?:降り|終了|終わ|抜け|失敗|落ち|戻|返|スキップ|無視|捨て|握りつぶ|動|進|通|処理|実行|成功|壊れ|exit|return)/g;
const message = "動作を程度や比喩で表しており、プログラムが何を出力し、どう終了するかが特定できない。本文や文脈から実際の動作（戻り値、終了コード、出力の有無と出力先など）を確かめて書く。特定できなければ値を推測せず、不足している情報として報告する。";

export default createRule((sentences) => find(sentences, pattern, message));

import { createRule, find } from "../rule.js";

const reason = "抽象的な名詞に物や体の動きを表す動詞を使うと、何が起きたかが一意に決まりません。";
const risingMessage = `${reason}誰が何をどう受け取るかを書いてください。文脈によっては起動など問題ない場合もあります。何が立ち上がるのかを確かめてください。`;
const omissionMessage = `${reason}何が省かれたかを確かめ、「削除された」「書かれていない」「引き継がれない」など実際の変化を書いてください。文脈によっては問題ない場合もあります。`;
const conditionMessage = `${reason}条件を「〜にまとめた」「〜に限った」など、条件をどうしたかを書いてください。文脈によっては問題ない場合もあります。何が変わったかを確かめてください。`;

function isDifferentFall(hit) {
  const match = hit.sentence.prose.slice(hit.index, hit.index + hit.length);
  const between = match.slice(match.search(/[がは]/) + 1, match.lastIndexOf("落ち"));
  return /[がは]|腑に\s*$/.test(between);
}

export default createRule((sentences) => [
  ...find(sentences, /(?:比喩|意味|イメージ|概念|物語|文脈|印象|感覚|輪郭|問い|論点)(?:が|は)[^。\n]{0,15}?立ち上が/g, risingMessage),
  ...find(sentences, /(?:限定|ニュアンス|判断|意図|理由|観点|制約|指示)(?:が|は)[^。、！？!?\n]{0,16}?落ち(?=る|た|て|ない|ます|ました|れば|ず)/g, omissionMessage)
    .filter((hit) => !isDifferentFall(hit)),
  ...find(sentences, /落ちた指示/g, omissionMessage),
  ...find(sentences, /条件(?:が|は)[^。、！？!?\n]{0,40}?に落ち(?=る|た|て|ない|ます|ました|れば|ず)/g, conditionMessage)
    .filter((hit) => !isDifferentFall(hit)),
]);

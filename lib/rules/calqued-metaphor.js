import { createRule, find } from "../rule.js";

const message = "skeleton などの比喩を直訳しており、日本語の「骨格」は解剖の意味が強く読み手の注意をそらす。「構成」「ひな形」など、指す内容を直接表す言葉にする。";

const scaffoldMessage = "「足場」では何を再利用するのか分かりにくい。対象に応じて共通レイアウトやひな形と書く。文脈によっては問題ない。ひな形と共通部分のどちらを指すか確かめる。";
const frameMessage = "「骨組み」では揃える内容が分かりにくい。章立てやHTMLの共通構造など対象を具体的に書く。文脈によっては問題ない。共通にする要素を確かめる。";
const foundationMessage = "「土台」では何をどこで再利用するのか分かりにくい。基になるファイルや構造を具体的に書く。文脈によっては問題ない。依存する内容と用途を確かめる。";

export default createRule((sentences) => [
  ...find(sentences, /骨格(?!筋|標本|推定|検出)/g, message),
  ...find(sentences, /足場(?!代|板|材)/g, scaffoldMessage)
    .filter((hit) => !/(?:工事|外壁|建設)(?:用|の)?$/.test(hit.sentence.original.slice(0, hit.index))),
  ...find(sentences, /骨組み/g, frameMessage)
    .filter((hit) => !/(?:HTML|html|body)(?:と(?:HTML|html|body))?の$/.test(hit.sentence.original.slice(0, hit.index))),
  ...find(sentences, /土台/g, foundationMessage)
    .filter((hit) => !/(?:ピラミッド|建物)の$/.test(hit.sentence.original.slice(0, hit.index))),
]);

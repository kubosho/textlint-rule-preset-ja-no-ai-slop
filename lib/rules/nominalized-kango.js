import { createRule, find } from "../rule.js";

const message = "「存在しない」を法律などで使う漢語の名詞にしており、技術文では不自然です。「〜が存在しない場合」のように節のまま書いてください。";

const missingMessage = "「未存在」は状態を名詞で表しており、対象と条件が分かりにくいです。「summaryが存在しないとき」のように節で書いてください。文脈によっては問題ありません。対象が存在しない条件と定義済みの状態名かを確かめてください。";
const ownerMessage = "「所有者不一致」は条件を名詞で表しています。「所有者が一致しない場合」のように節で書いてください。文脈によっては問題ありません。テストの状態名か、本文で説明する条件かを確かめてください。";
const pendingMessage = "「未実施」は行為を名詞で表しています。「検証していないため」のように動作を節で書いてください。文脈によっては問題ありません。進捗を示す状態名か、理由を説明する文かを確かめてください。";
const compoundMessage = "助詞を省いて漢語の名詞同士をつなげているため、「問題用法」なら「問題のある用法」のように助詞を入れて句で書いてください。文脈によっては問題ありません。何と何の関係を表す言葉か、定着した用語かを確かめてください。";

export default createRule((sentences) => [
  ...find(sentences, /不存在/g, message),
  ...find(sentences, /未存在/g, missingMessage),
  ...find(sentences, /所有者不一致/g, ownerMessage)
    .filter((hit) => !/^(?:という|の)(?:ケース|状態)/.test(hit.sentence.prose.slice(hit.index + hit.length))),
  ...find(sentences, /未実施(?!事項|項目|タスク)/g, pendingMessage)
    .filter((hit) => !/(?:は|が)\s*$/.test(hit.sentence.prose.slice(0, hit.index))
      || !/^(?:です|でした|だった|だ)?[。！？!?]*\s*$/.test(hit.sentence.prose.slice(hit.index + hit.length))),
  ...find(sentences, /問題確定|問題用法|問題件数|判定境界|出現合計|検出語/g, compoundMessage),
  ...find(sentences, /実装都合|対象限定|修正依頼文案|仕様判断|条件描画|問題継続|仕様明文化|修正必須|実装責務|仕様手戻り|原因到達|判定一本化|確認検索|修正往復/g, compoundMessage),
  ...find(sentences, /実装技術|仕様保証|実装移設|仕様書追加|対象外購入|出現演出|実装戦略確定|候補昇格|修正案反映|仕様把握|修正義務|実装共有|実装承認|実装追従/g, compoundMessage),
]);

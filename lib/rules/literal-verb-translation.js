import { createRule, find } from "../rule.js";

const message = "「割る」では、何をどう分けるのかが技術文として特定できない。「分割する」など動作を特定できる動詞にし、分ける対象も明示する。";

const placeMessage = "「置く」では配置・記述・実行のどの動作か分かりにくい。対象と動作を特定して書く（例：「検証コマンドをREADMEに記載する」）。文脈によっては問題ない。置く対象と場所、実際に行う操作を確かめる。";
const callMessage = "「呼ぶ」では開く・読み込む・実行するのどれか分かりにくい。行う動作を明示する（例：「READMEを開く」）。文脈によっては問題ない。呼び出す対象と実際の操作を確かめる。";
const alignMessage = "「寄せる」では処理を移すのか環境を揃えるのか分かりにくい。目的に合わせて書く（例：「baselineをCIと同じ環境で生成する」）。文脈によっては問題ない。何をどこでどう変更するかを確かめる。";
const connectMessage = "「繋ぐ」では呼び出しと依存の設定のどちらか分かりにくい。操作を明示する（例：「handlerからusecaseを呼び出す」）。文脈によっては問題ない。接続する対象と実際の動作を確かめる。";

export default createRule((sentences) => [
  ...find(sentences, /(?<![で役])割(?:る|った|って|ります|りました|れば|ろう)/g, message)
    .filter((hit) => !hit.sentence.prose.includes("掛け")),
  ...find(sentences, /を(?:[^。、\n]{0,12}?に)?置(?:く|い(?:た|て)|き(?:ます|ました|ません(?:でした)?|たい)|か(?:ない|なかった|れる)|け(?:ば|れば)|こう)/g, placeMessage)
    .filter((hit) => {
      const before = hit.sentence.original.slice(0, hit.index);
      return !/(?:距離|トラップ)$/.test(before)
        && !/(?:以下|ディレクトリ|フォルダ)(?:に|へ)[^。、\n]{0,30}$/.test(before);
    }),
  ...find(sentences, /を呼(?:ぶ|ん(?:だ|で)|び(?:ます|ました|ません(?:でした)?|たい)|ば(?:ない|なかった)|べば|ぼう)/g, callMessage)
    .filter((hit) => !/`?(?:API|ライブラリ|関数|メソッド|コマンド|skill)`?\s*$/.test(hit.sentence.original.slice(0, hit.index))),
  ...find(sentences, /(?:に|へ)\s*寄せ(?:る|た|て|ます|ました|ません(?:でした)?|ない|れば|よう|られる)/g, alignMessage)
    .filter((hit) => !/404\s*$/.test(hit.sentence.original.slice(0, hit.index))),
  ...find(sentences, /繋(?:ぐ|い(?:だ|で)|ぎ(?:ます|ました|ません(?:でした)?|たい)|が(?:ない|なかった|れる)|げば|ごう)/g, connectMessage)
    .filter((hit) => !/`?(?:ネットワーク|DB|データベース|外部サービス|LAN|ケーブル|回線|文字列|ファイル名)`?\s*(?:に|へ|と|を)?\s*$/.test(hit.sentence.original.slice(0, hit.index))),
]);

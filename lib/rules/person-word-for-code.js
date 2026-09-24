import { createRule, find } from "../rule.js";

const codeToken = /`[^`\n]+`|[A-Za-z_]\w*(?:\.|::)[A-Za-z_]|\b[a-z]+[A-Z]\w*|\b[A-Z][a-z0-9]+[A-Z]\w*|\w+\(\)|\b[a-z0-9]+_[a-z0-9_]+/;
const message = "コードの動作を尋ねているのに、人を指す「誰」を使っている。「コード上のどの部分で」のように、コード上の箇所を尋ねる言い方にする。";

export default createRule((sentences) =>
  find(sentences, /誰(?:が|から)/g, message).filter((hit) =>
    /変換|返(?:す|し|され)|呼|投げ|処理|生成|検証|捕捉|解析|パース|参照|書き換え|握りつぶ|ラップ/.test(
      hit.sentence.prose.slice(hit.index),
    ) && codeToken.test(hit.sentence.original),
  ),
);

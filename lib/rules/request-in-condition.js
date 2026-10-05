import { createRule, findTokens, is, tokenized } from "../rule.js";

const message = "依頼を主節に置いてください（例：「〜を実行してほしい」）。相手にしてほしい動作が条件節にあり、主節が書き手の動作になっています。";

// 「〜てもらえれば」「〜てくれたら」 and the like, reported from the verb that is requested.
function request(tokens, i) {
  if (!is(tokens[i], "助詞", "接続助詞", ["て", "で"])) return;
  if (!is(tokens[i + 1], "動詞") || !["もらえる", "くれる", "いただける"].includes(tokens[i + 1].basic_form)) return;
  const condition = tokens[i + 2];
  if (!is(condition, "助詞", "接続助詞", ["ば"]) && !is(condition, "助動詞", undefined, ["たら"])) return;
  let first = i - 1;
  while (is(tokens[first], "動詞", "接尾") || is(tokens[first], "助動詞")) first--;
  if (!is(tokens[first], "動詞")) return;
  return [first, i + 2];
}

export default createRule(async (sentences) =>
  findTokens(await tokenized(sentences), request, message)
    // Treat a subjectless main clause without a copular ending as the writer's action.
    // This does not verify that the clause ends in a verb.
    .filter((hit) => {
      const mainClause = hit.sentence.prose.slice(hit.index + hit.length);
      return (
        !mainClause.startsWith("と") &&
        !/(?:です|だ|である|でしょう)[。！？!?]*\s*$/.test(mainClause) &&
        !/[がはも]|助か|ありがた|有り難|うれし|嬉し/.test(mainClause)
      );
    }),
);

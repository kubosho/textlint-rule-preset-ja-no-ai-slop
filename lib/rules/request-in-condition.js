import { createRule, find } from "../rule.js";

const message = "相手にしてほしい動作が条件節にあり、主節が書き手の動作になっている。依頼を主節に置く（例：「〜を実行してほしい」）。";

export default createRule((sentences) =>
  find(sentences, /[てで](?:もらえれば|もらえたら|くれれば|くれたら|いただければ|いただけたら)/g, message)
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

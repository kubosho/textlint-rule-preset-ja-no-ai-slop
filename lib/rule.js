import { tokenize } from "kuromojin";
import { sentences } from "./prose.js";

function find(sentences, regex, message) {
  return sentences.flatMap((sentence) => Array.from(sentence.prose.matchAll(regex), (match) => ({
    sentence,
    index: match.index,
    length: match[0].length,
    message,
  })));
}

// Rules whose phrases conjugate or depend on word boundaries match tokens instead of characters, so
// that the reported span is the matched words themselves. A regex cannot tell where a Japanese word
// ends, so its spans would cut words at stems or start at particles.
async function tokenized(sentences) {
  return Promise.all(sentences.map(async (sentence) => {
    let position = 0;
    const tokens = (await tokenize(sentence.prose)).map((token) => {
      const start = position;
      position += token.surface_form.length;
      return { ...token, start, end: position };
    });
    return { ...sentence, tokens };
  }));
}

// `match` receives the sentence's tokens and an index, and returns the first and last token of a
// match starting there.
function findTokens(sentences, match, message) {
  return sentences.flatMap((sentence) => sentence.tokens.flatMap((_, index) => {
    const found = match(sentence.tokens, index, sentence);
    if (found === undefined) return [];
    const [first, last] = found;
    const start = sentence.tokens[first].start;
    return [{ sentence, index: start, length: sentence.tokens[last].end - start, message }];
  }));
}

const is = (token, pos, detail, surfaces) => token !== undefined
  && token.pos === pos
  && (detail === undefined || token.pos_detail_1 === detail)
  && (surfaces === undefined || surfaces.includes(token.surface_form));

const verb = (token, basicForms) => is(token, "動詞", "自立") && basicForms.includes(token.basic_form);

// Returns the index of the last token after the inflections that follow `last`.
function inflected(tokens, last) {
  while (
    is(tokens[last + 1], "助動詞")
    || is(tokens[last + 1], "動詞", "接尾")
    || is(tokens[last + 1], "助詞", "接続助詞", ["て", "で", "ば"])
  ) last++;
  return last;
}

// Returns the index of the last token of the verb at `index` with its inflection, or undefined when the
// verb is not one of `basicForms` or is a bare 連用形 such as 「何を割り、」.
function conjugated(tokens, index, basicForms) {
  if (!verb(tokens[index], basicForms)) return;
  const last = inflected(tokens, index);
  if (last === index && tokens[index].conjugated_form === "連用形") return;
  return last;
}

function createRule(check) {
  return (context) => {
    const { Syntax, RuleError, report, locator } = context;
    return {
      async [Syntax.Document](node) {
        for (const { sentence, index, length, message } of await check(sentences(node))) {
          const start = sentence.start + index;
          report(node, new RuleError(message, {
            padding: locator.range([start, start + length]),
          }));
        }
      },
    };
  };
}

export { find, tokenized, findTokens, is, verb, inflected, conjugated, createRule };

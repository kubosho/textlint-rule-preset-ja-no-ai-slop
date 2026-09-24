import { sentences } from "./prose.js";

function find(sentences, regex, message) {
  return sentences.flatMap((sentence) => Array.from(sentence.prose.matchAll(regex), (match) => ({
    sentence,
    index: match.index,
    length: match[0].length,
    message,
  })));
}

function createRule(check) {
  return (context) => {
    const { Syntax, RuleError, report, locator } = context;
    return {
      [Syntax.Document](node) {
        for (const { sentence, index, length, message } of check(sentences(node))) {
          const start = sentence.start + index;
          report(node, new RuleError(message, {
            padding: locator.range([start, start + length]),
          }));
        }
      },
    };
  };
}

export { find, createRule };

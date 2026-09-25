import preset from "../index.js";
import { cases } from "../test/fixtures.js";
import { lint } from "../test/lint.js";

const ruleIds = Object.keys(preset.rules);

function subtract(from, remove) {
  const remaining = remove.map((finding) => JSON.stringify([finding.ruleId, finding.match]));
  return from.filter((finding) => {
    const index = remaining.indexOf(JSON.stringify([finding.ruleId, finding.match]));
    if (index === -1) return true;
    remaining.splice(index, 1);
    return false;
  });
}

async function evaluate(testCases) {
  const results = [];
  for (const testCase of testCases) {
    const { messages } = await lint(testCase.text);
    const actual = messages.map(({ ruleId, range }) => ({
      ruleId,
      match: testCase.text.slice(...range),
    }));
    const expected = testCase.expected.filter((finding) => ruleIds.includes(finding.ruleId));
    results.push({
      id: testCase.id,
      missed: subtract(expected, actual),
      unexpected: subtract(actual, expected),
    });
  }
  return results;
}

function format(testCases, results) {
  const list = (name) => {
    const lines = results.flatMap((result) => result[name].map(
      ({ ruleId, match }) => `  ${result.id}：${ruleId}「${match}」`,
    ));
    return lines.length ? lines : ["  なし"];
  };
  const count = (name, ruleId) => results.flatMap((result) => result[name])
    .filter((finding) => finding.ruleId === ruleId).length;

  return [
    `評価データ：${testCases.length}件`,
    "",
    "規則ごとの件数",
    ...ruleIds.map((ruleId) => {
      const expected = testCases.flatMap((testCase) => testCase.expected)
        .filter((finding) => finding.ruleId === ruleId).length;
      return `  ${ruleId}：期待 ${expected}、検出漏れ ${count("missed", ruleId)}、誤検出 ${count("unexpected", ruleId)}`;
    }),
    "",
    "検出漏れ",
    ...list("missed"),
    "",
    "誤検出",
    ...list("unexpected"),
  ].join("\n");
}

if (import.meta.main) {
  evaluate(cases).then((results) => {
    console.log(format(cases, results));
    if (results.some(({ missed, unexpected }) => missed.length || unexpected.length)) process.exitCode = 1;
  }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { evaluate, format };

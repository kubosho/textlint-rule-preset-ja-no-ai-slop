import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { describe, it } from "node:test";
import preset from "../index.js";
import { evaluate, format } from "../scripts/evaluate.js";
import { cases } from "./fixtures.js";
import { lint } from "./lint.js";

describe("evaluation through textlint", () => {
  it("fixture files exist for every rule and shared quotations", () => {
    const files = readdirSync(new URL("./fixtures/", import.meta.url)).filter((name) => name.endsWith(".json"));
    assert.deepEqual(files.sort(), [...Object.keys(preset.rules).map((id) => `${id}.json`), "quoted.json"].sort());
  });

  it("registers every rule with expected findings in the shipped cases", () => {
    const expectedIds = new Set(cases.flatMap((testCase) => testCase.expected.map((finding) => finding.ruleId)));
    assert.deepEqual(Object.keys(preset.rules).sort(), [...expectedIds].sort());
  });

  it("matches every shipped case for all registered rules", async () => {
    const mismatches = (await evaluate(cases)).filter(
      ({ missed, unexpected }) => missed.length || unexpected.length,
    );
    assert.deepEqual(mismatches, []);
  });

  it("no finding in the shipped cases has a fix", async () => {
    const fixes = [];
    for (const testCase of cases) {
      const { messages } = await lint(testCase.text);
      for (const message of messages) {
        if (message.fix !== undefined) {
          fixes.push({
            caseId: testCase.id,
            ruleId: message.ruleId,
            match: testCase.text.slice(...message.range),
            fix: message.fix,
          });
        }
      }
    }
    assert.deepEqual(fixes, []);
  });

  it("identifies a missed span by rule ID and exact match", async () => {
    const [result] = await evaluate([{
      id: "missing",
      text: "本文。",
      expected: [{ ruleId: "unspecified-behavior", match: "無言で終了" }],
    }]);
    assert.deepEqual(result, {
      id: "missing",
      missed: [{ ruleId: "unspecified-behavior", match: "無言で終了" }],
      unexpected: [],
    });
  });

  it("identifies an unexpected span even when the case has no expected findings", async () => {
    const [result] = await evaluate([{ id: "unexpected", text: "黙って返す。", expected: [] }]);
    assert.deepEqual(result.unexpected, [
      { ruleId: "unspecified-behavior", match: "黙って返す" },
    ]);
  });

  it("lists each registered rule's counts and names mismatching cases", async () => {
    const input = [
      {
        id: "missing",
        text: "本文。",
        expected: [{ ruleId: "unspecified-behavior", match: "無言で終了" }],
      },
      { id: "unexpected", text: "黙って返す。", expected: [] },
    ];
    const output = format(input, await evaluate(input));
    assert.match(output, /unspecified-behavior：期待 1、検出漏れ 1、誤検出 1/);
    assert.match(output, /検出漏れ\n  missing：unspecified-behavior「無言で終了」/);
    assert.match(output, /誤検出\n  unexpected：unspecified-behavior「黙って返す」/);
  });

  it("counts repeated identical spans separately", async () => {
    const [result] = await evaluate([{
      id: "duplicate",
      text: "黙って返す。黙って返す。",
      expected: [{ ruleId: "unspecified-behavior", match: "黙って返す" }],
    }]);
    assert.deepEqual(result.missed, []);
    assert.deepEqual(result.unexpected, [
      { ruleId: "unspecified-behavior", match: "黙って返す" },
    ]);
  });
});

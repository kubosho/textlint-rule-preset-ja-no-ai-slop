import assert from "node:assert/strict";
import { it } from "node:test";
import { lint } from "./lint.js";

it("field terms explain their intended meaning and ask for context", async () => {
  const examples = [
    ["この項目は過積載だ。", "何が余分"],
    ["この判断は越権だ。", "どの担当範囲"],
    ["この文書が正本だ。", "唯一の参照元"],
    ["この規則が憲法だ。", "最優先のルール"],
    ["この項目は未決だ。", "未確定"],
    ["変更を布告する。", "どの方針"],
    ["指摘を追い返す。", "相手に何を返す"],
    ["硬い語を避ける。", "数えられる単位なら「単語」"],
  ];

  for (const [text, correction] of examples) {
    const { messages } = await lint(text);
    assert.equal(messages.length, 1, text);
    assert.match(messages[0].message, /読み手にその分野での意味を考えさせる/);
    assert.ok(messages[0].message.includes(correction), text);
    assert.match(messages[0].message, /問題ない場合もある。何を指す言葉か/);
  }
});

for (const text of [
  "語を選ぶ。",
  "硬い語を避ける。",
  "分野の語を調べる。",
  "表す語がある。",
  "同じ語を使う。",
  "副作用：語の所在を示す。",
  "😀語を選ぶ。",
  "語自体を確認する。",
  "語単位で数える。",
  "語同士を比べる。",
]) {
  it(`${text} points to the single character 語`, async () => {
    const { messages } = await lint(text);
    const findings = messages.filter(({ ruleId }) => ruleId === "foreign-field-term");
    assert.deepEqual(findings.map(({ range }) => text.slice(...range)), ["語"]);
  });
}

for (const text of [
  "用語を確認する。",
  "日本語を読む。",
  "物語を書く。",
  "ドイツ語を学ぶ。",
  "1語を数える。",
  "一語を数える。",
  "用語自体、日本語同士、単語単位を比べる。",
  "語句を確認する。",
  "語尾を直す。",
  "語弊がある。",
  "語録を読む。",
  "語る。語った。語り、語れば、語ろう。",
  "「語」を単体で使わない。",
  "`語`を単体で使わない。",
  "Ａ語とA語、ａ語と９語、カ語とー語、々語と𠮟語を確認する。",
]) {
  it(`${text} does not report foreign-field-term`, async () => {
    const { messages } = await lint(text);
    assert.deepEqual(messages.filter(({ ruleId }) => ruleId === "foreign-field-term"), []);
  });
}

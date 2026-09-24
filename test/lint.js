import { TextlintKernel } from "@textlint/kernel";
import markdownModule from "@textlint/textlint-plugin-markdown";
import plainTextModule from "@textlint/textlint-plugin-text";
import preset from "../index.js";

const markdown = markdownModule.default;
const plainText = plainTextModule.default;

const kernel = new TextlintKernel();

async function lint(text, ext = ".md") {
  return kernel.lintText(text, {
    ext,
    filePath: `case${ext}`,
    rules: Object.entries(preset.rules).map(([ruleId, rule]) => ({
      ruleId,
      rule,
      options: preset.rulesConfig[ruleId],
    })),
    plugins: [{
      pluginId: ext === ".md" ? "@textlint/textlint-plugin-markdown" : "@textlint/textlint-plugin-text",
      plugin: ext === ".md" ? markdown : plainText,
      options: true,
    }],
  });
}

export { lint };

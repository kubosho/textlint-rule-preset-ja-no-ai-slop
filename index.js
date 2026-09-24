import literalVerbTranslation from "./lib/rules/literal-verb-translation.js";
import requestInCondition from "./lib/rules/request-in-condition.js";
import unspecifiedBehavior from "./lib/rules/unspecified-behavior.js";

export default {
  rules: {
    "literal-verb-translation": literalVerbTranslation,
    "request-in-condition": requestInCondition,
    "unspecified-behavior": unspecifiedBehavior,
  },
  rulesConfig: {
    "literal-verb-translation": true,
    "request-in-condition": true,
    "unspecified-behavior": true,
  },
};

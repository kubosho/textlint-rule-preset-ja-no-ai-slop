import literalVerbTranslation from "./lib/rules/literal-verb-translation.js";
import requestInCondition from "./lib/rules/request-in-condition.js";
import calquedMetaphor from "./lib/rules/calqued-metaphor.js";
import foreignFieldTerm from "./lib/rules/foreign-field-term.js";
import unspecifiedBehavior from "./lib/rules/unspecified-behavior.js";

export default {
  rules: {
    "literal-verb-translation": literalVerbTranslation,
    "request-in-condition": requestInCondition,
    "calqued-metaphor": calquedMetaphor,
    "foreign-field-term": foreignFieldTerm,
    "unspecified-behavior": unspecifiedBehavior,
  },
  rulesConfig: {
    "literal-verb-translation": true,
    "request-in-condition": true,
    "calqued-metaphor": true,
    "foreign-field-term": true,
    "unspecified-behavior": true,
  },
};

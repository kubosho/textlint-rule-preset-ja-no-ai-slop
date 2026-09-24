import literalVerbTranslation from "./lib/rules/literal-verb-translation.js";
import requestInCondition from "./lib/rules/request-in-condition.js";
import calquedMetaphor from "./lib/rules/calqued-metaphor.js";
import foreignFieldTerm from "./lib/rules/foreign-field-term.js";
import physicalVerbForAbstract from "./lib/rules/physical-verb-for-abstract.js";
import nominalizedKango from "./lib/rules/nominalized-kango.js";
import unspecifiedBehavior from "./lib/rules/unspecified-behavior.js";

export default {
  rules: {
    "literal-verb-translation": literalVerbTranslation,
    "request-in-condition": requestInCondition,
    "calqued-metaphor": calquedMetaphor,
    "foreign-field-term": foreignFieldTerm,
    "physical-verb-for-abstract": physicalVerbForAbstract,
    "nominalized-kango": nominalizedKango,
    "unspecified-behavior": unspecifiedBehavior,
  },
  rulesConfig: {
    "literal-verb-translation": true,
    "request-in-condition": true,
    "calqued-metaphor": true,
    "foreign-field-term": true,
    "physical-verb-for-abstract": true,
    "nominalized-kango": true,
    "unspecified-behavior": true,
  },
};

const natural = require("natural");
const tokenizer = new natural.AggressiveTokenizerSv();
const filters = [["brinner", "fire"], ["brand", "fire"], ["skogsbrand", "fire"], ["eld", "fire"], ["eldssvåda", "fire"], ["olycka", "accident"], ["olyckor", "accident"], ["trafikolycka", "accident"], ["krock", "accident"]];

/**
 * documentDescription is the content/string/data to evaluate
 * will return type, if found, based on filters.
 */
module.exports = function filterDocument(documentDescription) {
        const documentLowerCase = documentDescription.toLowerCase();
        const tokens = tokenizer.tokenize(documentLowerCase);
        const filterMap = new Map(filters);
        for(let filter of filterMap.keys()) {
            if (tokens.includes(filter)) {
                return filterMap.get(filter);
            }
        }
        return null;
    }
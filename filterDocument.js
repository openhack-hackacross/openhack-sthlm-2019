const filters = ["brinner", "brand", "skogsbrand", "eld", "eldssvåda"];
const natural = require("natural");
const tokenizer = new natural.AggressiveTokenizerSv();

module.exports = function (documentDescription) {
        const documentLowerCase = documentDescription.toLowerCase();
        const tokens = tokenizer.tokenize(documentDescription);
        for(let filter of filters) {
            if (documentLowerCase.includes(filter)) {
                return true;
            }
        }
        return false;
    }

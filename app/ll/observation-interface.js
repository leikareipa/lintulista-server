/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const {LL_UintStringer} = require("./uint-stringer.js");
const {LL_Assert} = require("./assert.js");

module.exports = {
    LL_Observation: generate_observation_interface(),
};

// Provides functionality for dealing with observations.
function generate_observation_interface()
{
    const fileSystem = require("fs");
    const knownBirds = JSON.parse(fileSystem.readFileSync("./ll/metadata/known-birds.json", "utf-8")).birds;

    const publicInterface = {
        // Converts into a string an observation of the given species on the given date.
        encode_to_string: function(species, day, month, year)
        {
            // Basic sanity checks. Note that this doesn't guarantee e.g. that
            // the given month actually has the given number of days.
            LL_Assert((day > 0) &&
                      (day <= 31) &&
                      (month > 0) &&
                      (month <= 12) &&
                      (year > 2000) &&
                      (year < 9000),
                      "Invalid observation date.");

            const speciesIdx = knownBirds.findIndex(b=>b.species==species);

            LL_Assert((speciesIdx >= 0), "Unknown species.");

            return LL_UintStringer.uints2string([[2, speciesIdx],
                                                 [1, day],
                                                 [1, month],
                                                 [2, year]]);
        },

        // Decodes a string (or a concatenation of strings) produced by this.encode_to_string()
        // into an observation object.
        decode_from_string: function(string)
        {
            const substrings = split_observation_string(string);
            const observations = [];

            for (const substring of substrings)
            {
                const [speciesIdx, day, month, year] = LL_UintStringer.string2uints(substring, [2, 1, 1, 2]);

                LL_Assert((speciesIdx >= 0) &&
                          (speciesIdx < knownBirds.length),
                          `Invalid species index ${speciesIdx}.`);

                observations.push({
                    species: knownBirds[speciesIdx].species,
                    day,
                    month,
                    year: year,
                });
            }

            return observations;
        },
    };

    return publicInterface;

    // Takes in a string containing one or more observation strings. Returns
    // an array in which each observation string is in its own element. E.g.
    // "/bG.GM/?))GM"+(65/GM" -> ["/bG.GM", "/?))GM", "(65/GM"].
    function split_observation_string(string)
    {
        const substringLength = 6;

        LL_Assert(((string.length % substringLength) == 0),
                  `Invalid observation string ${string}.`);

        const substrings = [];
            
        while (string.length)
        {
            const newSubstring = string.substring(0, substringLength);

            LL_Assert((newSubstring.length == substringLength),
                      `Invalid observation substring ${newSubstring}.`);

            substrings.push(newSubstring);
            string = string.slice(substringLength);
        }

        return substrings;
    }
}

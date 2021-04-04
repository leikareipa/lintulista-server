/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

module.exports = {
    Observation: factory_Observation(),
};

const {UintStringer} = require("./uint-stringer.js");
const {assert} = require("./assert.js");

// Provides functionality for dealing with observations.
function factory_Observation()
{
    const fileSystem = require("fs");
    const knownBirds = JSON.parse(fileSystem.readFileSync("./metadata/known-birds.json", "utf-8")).birds;

    const publicInterface = {
        // Converts into a string an observation of the given species on the given date.
        encode_to_string: function(species, day, month, year)
        {
            // Basic sanity checks. Note that this doesn't guarantee e.g. that
            // the given month actually has the given number of days.
            assert((day > 0) &&
                   (day <= 31) &&
                   (month > 0) &&
                   (month <= 12) &&
                   (year > 2000) &&
                   (year < 9000),
                   "Invalid observation date.");

            const speciesIdx = knownBirds.findIndex(b=>b.species==species);

            assert((speciesIdx >= 0), "Unknown species.");

            return UintStringer.uints2string([[2, speciesIdx],
                                              [1, day],
                                              [1, month],
                                              [2, year]]);
        },

        // Decodes a string produced by this.encode_to_string().
        decode_from_string: function(string)
        {
            const [speciesIdx, day, month, year] = UintStringer.string2uints(string, [2, 1, 1, 2]);

            assert((speciesIdx >= 0) &&
                (speciesIdx < knownBirds.length),
                "Invalid species identifier.");

            return {
                species: knownBirds[speciesIdx].species,
                day,
                month,
                year: year,
            }
        },
    };

    return publicInterface;
}

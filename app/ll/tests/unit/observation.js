/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const {LL_Assert} = require("../../assert.js");
const {LLTest_ExpectThrow,
       LLTest_ExpectTrue} = require("../test-assert.js");

// The unit to be tested.
const {LL_Observation} = require("../../observation.js");

module.exports = {
    test: test_Oservation,
};

async function test_Oservation()
{
    const validObservation = Object.freeze({
        species: "Jänkäkurppa",
        day: 24,
        month: 3,
        year: 2005,
    });

    // Encoding/decoding valid data.
    {
        const encoded = LL_Observation.encode_to_string(validObservation);
        const decoded = LL_Observation.decode_from_string(encoded);

        LLTest_ExpectTrue(()=>Array.isArray(decoded));
        LLTest_ExpectTrue(()=>decoded.length === 1);
        LLTest_ExpectTrue(()=>decoded[0].species === validObservation.species);
        LLTest_ExpectTrue(()=>decoded[0].day === validObservation.day);
        LLTest_ExpectTrue(()=>decoded[0].month === validObservation.month);
        LLTest_ExpectTrue(()=>decoded[0].year === validObservation.year);
    }

    // Encoding invalid data.
    {
        LLTest_ExpectThrow(()=>LL_Observation.encode_to_string([
            "Not a valid format",
        ]));

        LLTest_ExpectThrow(()=>LL_Observation.encode_to_string({}));

        LLTest_ExpectThrow(()=>LL_Observation.encode_to_string({
            ...validObservation,
            species: "Unknown bird of some type",
        }));

        LLTest_ExpectThrow(()=>LL_Observation.encode_to_string({
            ...validObservation,
            species: "",
        }));

        // Day should be 1-indexed.
        LLTest_ExpectThrow(()=>LL_Observation.encode_to_string({
            ...validObservation,
            day: 0,
        }));

        LLTest_ExpectThrow(()=>LL_Observation.encode_to_string({
            ...validObservation,
            day: 32,
        }));

        // Month should be 1-indexed.
        LLTest_ExpectThrow(()=>LL_Observation.encode_to_string({
            ...validObservation,
            month: 0,
        }));

        LLTest_ExpectThrow(()=>LL_Observation.encode_to_string({
            ...validObservation,
            month: 13,
        }));
    }

    // Decoding invalid data.
    {
        LLTest_ExpectThrow(()=>LL_Observation.decode_to_string({
            ...validObservation,
            species: "Unknown bird of some type",
        }));
    }
    
    return;
}

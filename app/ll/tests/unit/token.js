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
const {LL_GenerateToken,
       LL_IsTokenWellFormed} = require("../../token.js");

module.exports = {
    test: test_Token,
};

async function test_Token()
{
    const expectedTokenLength = 30;
    const validToken = "a".repeat(expectedTokenLength);
    const generatedToken = LL_GenerateToken();

    // Token surface validity.
    LLTest_ExpectTrue(()=>typeof generatedToken === "string");
    LLTest_ExpectTrue(()=>generatedToken.length === 30);

    // Verify that generated tokens are to at least some extent random.
    {
        const tokens = new Array(10000).fill().map(e=>LL_GenerateToken());

        for (let i = 0; i < tokens.length; i++) {
            for (let p = (i + 1); p < tokens.length; p++) {
                LLTest_ExpectTrue(()=>tokens[i] !== tokens[p]);
            }
        }
    }

    // Accept valid tokens.
    LLTest_ExpectTrue(()=>LL_IsTokenWellFormed(validToken) === true);

    // See that the token generator can quite reliably generate valid tokens.
    for (let i = 0; i < 10000; i++) {
        LLTest_ExpectTrue(()=>LL_IsTokenWellFormed(LL_GenerateToken()) === true);
    }

    // Reject invalid tokens.
    LLTest_ExpectTrue(()=>LL_IsTokenWellFormed("a".repeat(expectedTokenLength - 1)) === false);
    LLTest_ExpectTrue(()=>LL_IsTokenWellFormed(1) === false);
    LLTest_ExpectTrue(()=>LL_IsTokenWellFormed({}) === false);
    LLTest_ExpectTrue(()=>LL_IsTokenWellFormed() === false);
    LLTest_ExpectTrue(()=>LL_IsTokenWellFormed([]) === false);
    LLTest_ExpectTrue(()=>LL_IsTokenWellFormed(NaN) === false);
    LLTest_ExpectTrue(()=>LL_IsTokenWellFormed(Infinity) === false);

    return;
}

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
const {LL_IsListKeyValid} = require("../../list-key.js");

module.exports = {
    test: test_ListKey,
};

async function test_ListKey()
{
    const keyLength = 9;

    function make_valid_key(string)
    {
        let validKey = new Array(keyLength).fill("a");
        for (let i = 0; i < Math.min(validKey.length, string.length); i++) {
            validKey[i] = string[i];
        }
        return validKey.join("").toLowerCase();
    }
    
    // Accept valid keys.
    LLTest_ExpectTrue(()=>LL_IsListKeyValid(make_valid_key("aaaaaaaaa")) === true);
    LLTest_ExpectTrue(()=>LL_IsListKeyValid(make_valid_key("abcdefghi")) === true);
    LLTest_ExpectTrue(()=>LL_IsListKeyValid(make_valid_key(String("aaaaaaaaa"))) === true);

    // Reject keys that aren't strings.
    LLTest_ExpectTrue(()=>LL_IsListKeyValid(new String("a".repeat(keyLength))) === false);
    LLTest_ExpectTrue(()=>LL_IsListKeyValid(1) === false);
    LLTest_ExpectTrue(()=>LL_IsListKeyValid(1.5) === false);
    LLTest_ExpectTrue(()=>LL_IsListKeyValid(NaN) === false);
    LLTest_ExpectTrue(()=>LL_IsListKeyValid(Infinity) === false);
    LLTest_ExpectTrue(()=>LL_IsListKeyValid({}) === false);
    LLTest_ExpectTrue(()=>LL_IsListKeyValid([]) === false);
    LLTest_ExpectTrue(()=>LL_IsListKeyValid() === false);
    LLTest_ExpectTrue(()=>LL_IsListKeyValid(function(){}) === false);

    // Reject keys with invalid characters.
    for (let i = 0; i < 100000; i++)
    {
        const chr = String.fromCharCode(i);
        const key = chr.repeat(keyLength);
        const shouldBeValid = !key.match(/[^a-z]/);
        LLTest_ExpectTrue(()=>LL_IsListKeyValid(key) === shouldBeValid);
    }

    // Reject keys with invalid lengths.
    for (let i = 0; i < 100000; i++)
    {
        const shouldBeValid = (i == keyLength);
        LLTest_ExpectTrue(()=>LL_IsListKeyValid("a".repeat(i)) === shouldBeValid);
    }

    return;
}

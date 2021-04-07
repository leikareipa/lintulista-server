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
const {LL_UintStringer} = require("../../uint-stringer.js");

module.exports = {
    test: test_UintStringer,
};

async function test_UintStringer()
{
    const numSymbols = 64;
    const leftPadSymbol = "#";
    const firstSymbol = "(";
    const lastSymbol = String.fromCharCode(firstSymbol.charCodeAt(0) + numSymbols - 1);

    function symbol_of_value(value)
    {
        const charCode = (firstSymbol.charCodeAt(0) + value);
        LL_Assert((charCode <= lastSymbol.charCodeAt(0)), "Overflowing the symbol table.");
        return String.fromCharCode(charCode);
    }

    // Test uint2string().
    {
        // Increasing values should follow the ASCII table accordingly.
        for (let i = 0; i < numSymbols; i++)
        {
            LLTest_ExpectTrue(()=>LL_UintStringer.uint2string(i, 1) === symbol_of_value(i));
            LLTest_ExpectTrue(()=>LL_UintStringer.uint2string((numSymbols + i), 2) === (symbol_of_value(1) + symbol_of_value(i)));
        }

        // Values spanning two characters.
        LLTest_ExpectTrue(()=>LL_UintStringer.uint2string((numSymbols - 1), 2) === (leftPadSymbol + symbol_of_value(numSymbols - 1)));
        LLTest_ExpectTrue(()=>LL_UintStringer.uint2string((numSymbols + 0), 2) === (symbol_of_value(1) + symbol_of_value(0)));
        LLTest_ExpectTrue(()=>LL_UintStringer.uint2string((numSymbols + 1), 2) === (symbol_of_value(1) + symbol_of_value(1)));

        // Expected number of characters (overflow shouldn't fit in a string of length 1).
        LLTest_ExpectThrow(()=>LL_UintStringer.uint2string((numSymbols + 1), 1));

        // Non-integer values not allowed.
        LLTest_ExpectThrow(()=>LL_UintStringer.uint2string(0.5, 1));

        // Negative values not allowed.
        LLTest_ExpectThrow(()=>LL_UintStringer.uint2string(-1, 1));

        // Negative 0 should be ok.
        LLTest_ExpectTrue(()=>LL_UintStringer.uint2string(-0, 1) === LL_UintStringer.uint2string(0, 1));

        // Zero-length strings not allowed.
        LLTest_ExpectThrow(()=>LL_UintStringer.uint2string(1, 0));

        // String not long enough to hold value.
        LLTest_ExpectThrow(()=>LL_UintStringer.uint2string(1e3, 1));

        // String padding.
        LLTest_ExpectTrue(()=>LL_UintStringer.uint2string(0, 47).length === 47);
        for (let i = 2; i < 10; i++)
        {
            LLTest_ExpectTrue(()=>LL_UintStringer.uint2string(0, i) === (leftPadSymbol.repeat(i - 1) + symbol_of_value(0)));
        }
    }

    // Test uints2string().
    {
        const lengths = [1, 3, 10, 99, 2,];
        const values = [5, 450, 0, 70000, 4095,];
        const expectedStringLength = lengths.reduce((totalLen, len)=>totalLen+len);
        const string = LL_UintStringer.uints2string(new Array(values.length).fill().map((e, idx)=>[lengths[idx], values[idx]]));

        LLTest_ExpectTrue(()=>string.length === expectedStringLength);
    }

    // Test string2uints().
    {
        const lengths = [1, 3, 10, 99, 2,];
        const values = [5, 450, 0, 70000, 4095,];
        const expectedStringLength = lengths.reduce((totalLen, len)=>totalLen+len);
        
        const string = LL_UintStringer.uints2string(new Array(values.length).fill().map((e, idx)=>[lengths[idx], values[idx]]));
        const valuesBack = LL_UintStringer.string2uints(string, lengths);

        LLTest_ExpectTrue(()=>string.length === expectedStringLength);
        LLTest_ExpectTrue(()=>values.length === valuesBack.length);

        for (let i = 0; i < values.length; i++)
        {
            LLTest_ExpectTrue(()=>values[i] === valuesBack[i]);
        }
    }

    return;
}

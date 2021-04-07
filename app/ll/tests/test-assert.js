/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const {LL_Assert} = require("../assert.js");
const {LLTest_Error,
       LLTest_IsOwnError} = require("./test-error.js");

module.exports = {
    LLTest_ExpectTrue: expect_true,
    LLTest_ExpectThrow: expect_throw,
};

function expect_true(test_fn = ()=>false)
{
    LL_Assert((typeof test_fn === "function"), "Invalid arguments.");

    try
    {
        if (!test_fn())
        {
            throw LLTest_Error(`Not true: ${test_fn.toString()}`);
        }
    }
    catch (error)
    {
        if (!LLTest_IsOwnError(error))
        {
            console.error("Encountered a runtime error while evaluating test expression.");
        }

        throw error;
    }

    return;
}

function expect_throw(test_fn = ()=>{throw 0})
{
    LL_Assert((typeof test_fn === "function"), "Invalid arguments.");

    try
    {
        test_fn();
    }
    catch
    {
        return;
    }
    
    throw LLTest_Error(`No throw: ${test_fn.toString()}`);
}

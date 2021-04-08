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
    LLTest_ExpectTrueAsync: expect_true_async,
    LLTest_ExpectThrow: expect_throw,
    LLTest_ExpectThrowAsync: expect_throw_async,
};

function expect_true(test_fn = ()=>false)
{
    LL_Assert((typeof test_fn === "function"), "Invalid arguments.");

    try
    {
        if (!test_fn()) {
            throw LLTest_Error(`Not true: ${test_fn.toString()}`);
        }
    }
    catch (error)
    {
        if (!LLTest_IsOwnError(error)) {
            console.error("Encountered a runtime error while evaluating test expression.");
        }

        throw error;
    }

    return;
}

async function expect_true_async(async_test_fn = async()=>false)
{
    LL_Assert((typeof async_test_fn === "function"), "Invalid arguments.");

    try
    {
        if (!(await async_test_fn())) {
            throw LLTest_Error(`Not true: ${async_test_fn.toString()}`);
        }
    }
    catch (error)
    {
        if (!LLTest_IsOwnError(error)) {
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

async function expect_throw_async(async_test_fn = async()=>{throw 0})
{
    LL_Assert((typeof async_test_fn === "function"), "Invalid arguments.");

    try
    {
        await async_test_fn();
    }
    catch
    {
        return;
    }
    
    throw LLTest_Error(`No throw: ${async_test_fn.toString()}`);
}

/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const {LL_Assert} = require("../assert.js");

const name = "LLTestError";

module.exports = {
    LLTest_Error: test_error,
    LLTest_IsOwnError: is_lltest_error,
};

// Returns an object that Lintulista's test modules can throw to signal test failure.
function test_error(errorReason = "")
{
    LL_Assert((typeof errorReason === "string"), "Invalid arguments.");

    return {
        name,
        message: (errorReason || "Undefined error"),
    };
}

function is_lltest_error(error = Error)
{
    return (error.name === name);
}

/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const {LLTest_IsOwnError} = require("./test-error.js");

module.exports = run_unit_tests;

async function run_unit_tests()
{
    const tests = {
        "UintStringer": require("./unit/uint-stringer.js").test,
    };

    let numTestsFailed = 0;

    console.log("Running unit tests...");

    for (const testName of Object.keys(tests))
    {
        try
        {
            console.log(testName);
            await tests[testName]();
        }
        catch (error)
        {
            if (LLTest_IsOwnError(error))
            {
                numTestsFailed++;
                console.error(`\tFAIL ${error.message}`);
            }
            else
            {
                console.error("Runtime error. Canceling unit testing.");
                throw error;
            }
        }
    }

    const resultString = "Result: " +
                         ((numTestsFailed <= 0)
                          ? "All passed."
                          : `${numTestsFailed}/${Object.keys(tests).length} failed.`);

    console.log(resultString);
    return resultString;
}

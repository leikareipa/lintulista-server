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
        "ListKey": require("./unit/list-key.js").test,
        "Observation": require("./unit/observation.js").test,
        "Token": require("./unit/token.js").test,
    };

    let numTestsFailed = 0;

    console.log(`Running unit tests (${new Date().toISOString()})`);

    for (const testName of Object.keys(tests))
    {
        let success = false;
        let errorMessage = "";

        try
        {
            await tests[testName]();
            success = true;
        }
        catch (error)
        {
            success = false;

            if (LLTest_IsOwnError(error)) {
                numTestsFailed++;
                errorMessage = error.message;
            }
            else {
                console.error("Runtime error. Canceling unit testing.");
                throw error;
            }
        }

        if (success) {
            console.log(`\x1b[37m\x1b[42m PASS \x1b[0m ${testName}`);
        }
        else {
            console.log(`\x1b[37m\x1b[41m FAIL \x1b[0m ${testName}: ${errorMessage}`);
        }
    }

    const resultString = "Finished: " +
                         ((numTestsFailed <= 0)
                          ? "All passed."
                          : `${numTestsFailed}/${Object.keys(tests).length} failed.`);

    console.log(resultString, "\n");
    return resultString;
}

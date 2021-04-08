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
        "Observation": require("./unit/observation.js").test,
        "Token": require("./unit/token.js").test,
        "ListKey": require("./unit/list-key.js").test,
        "Database": require("./unit/database.js").test,
    };

    let numTestsFailed = 0;

    console.log(`Running unit tests (${new Date().toISOString()})`);

    for (const testName of Object.keys(tests))
    {
        let success = false;
        let errorMessage = "";

        process.stdout.write(` ....  ${testName}  `);

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

        process.stdout.clearLine();
        process.stdout.cursorTo(0);

        if (success) {
            process.stdout.write(`\x1b[37m\x1b[42m PASS \x1b[0m ${testName}\n`);
        }
        else {
            process.stdout.write(`\x1b[37m\x1b[41m FAIL \x1b[0m ${testName}: ${errorMessage}\n`);
        }
    }

    const resultString = "Done. " +
                         ((numTestsFailed <= 0)
                          ? "All tests passed."
                          : `${numTestsFailed}/${Object.keys(tests).length} tests failed.`);

    console.log(resultString, "\n");
    return resultString;
}

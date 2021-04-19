/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const {LL_Assert} = require("./assert.js");
const {LL_Respond} = require("./response.js");
const {LL_Database} = require("./database.js");

module.exports = {
    route: route_login,
};

const requestProcessorFunctions = {
    "GET": process_get,
    "POST": process_post,
    "DELETE": process_delete,
    "OPTIONS": process_options,
};

const allowedMethods = Object.keys(requestProcessorFunctions).join(", ");

// Throws on error; caller is expected to catch.
async function route_login({listKey, requestMethod, requestBody, response})
{
    const database = LL_Database(listKey);
    const processor_fn = (requestProcessorFunctions[requestMethod] || process_default);
    await processor_fn({response, database, requestBody});

    return;
}

async function process_default({response})
{
    LL_Respond(405, response).message("Unrecognized method.");

    return;
}

async function process_get({response})
{
    LL_Respond(200, response).message("POST logs in, DELETE logs out.");

    return;
}

async function process_options({response})
{
    LL_Respond(200, response).allowed_methods(allowedMethods);

    return;
}

// Login.
async function process_post({response, database, requestBody})
{
    LL_Assert(((typeof requestBody == "object") &&
               requestBody.hasOwnProperty("username") &&
               requestBody.hasOwnProperty("password")),
              "Malformed request body.");

    const loginInfo = await database.login(requestBody.username, requestBody.password);

    if (loginInfo === false) {
        LL_Respond(401, response).message("Invalid credentials.");
    }
    else
    {
        LL_Assert(((typeof loginInfo === "object") &&
                   loginInfo.hasOwnProperty("token") &&
                   loginInfo.hasOwnProperty("until")),
                  "Malformed login.");

        LL_Respond(200, response).json({
            token: loginInfo.token,
            until: loginInfo.until,
        });
    }

    return;
}

// Logout.
async function process_delete({response, database, requestBody})
{
    LL_Assert(((typeof requestBody == "object") &&
               requestBody.hasOwnProperty("token")),
              "Malformed request body.");

    await database.logout(requestBody.token);

    LL_Respond(200, response).as_is();

    return;
}

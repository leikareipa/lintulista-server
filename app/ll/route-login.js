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

async function process_post({response, database, requestBody})
{
    /// TODO.

    return;
}

async function process_delete({response, database, requestBody})
{
    /// TODO.
    
    return;
}

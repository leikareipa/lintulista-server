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
    route: route_root,
};

const requestProcessorFunctions = {
    "GET": process_get,
    "PUT": process_put,
    "DELETE": process_delete,
    "OPTIONS": process_options,
};

const allowedMethods = Object.keys(requestProcessorFunctions).join(", ");

// Throws on error; caller is expected to catch.
async function route_root({listKey, requestMethod, requestBody, response})
{
    const database = LL_Database(listKey);

    if (!(await database.does_list_exist())) {
        LL_Respond(404, response).as_is();
        return;
    }

    const processor_fn = (requestProcessorFunctions[requestMethod] || process_default);
    await processor_fn({response, database, requestBody});

    return;
}

async function process_default({response})
{
    LL_Respond(405, response).message("Unrecognized method.");

    return;
}

async function process_options({response})
{
    LL_Respond(200, response).allowed_methods(allowedMethods);

    return;
}

// Inserts a new observation into a list. Expects the request body to be a JSON
// object of the following form,
//
// {
//     token: "...",
//     species: "...",
//     day: x,
//     month: y,
//     year: z,
// }
//
// where 'token' represents token authentication proving that the client has write
// access to the list, 'species' identifies the bird species observed, and 'day'/
// 'month'/'year' give the observation's timestamp ('day' is in the range 1-31,
// 'month' in 1-12).
async function process_put({response, database, requestBody})
{
    LL_Assert(((typeof requestBody == "object") &&
               requestBody.hasOwnProperty("token") &&
               requestBody.hasOwnProperty("species") &&
               requestBody.hasOwnProperty("day") &&
               requestBody.hasOwnProperty("month") &&
               requestBody.hasOwnProperty("year")),
              "Malformed request body.");

    await database.add_observation(requestBody.token,
                                   {species: requestBody.species,
                                    day: requestBody.day,
                                    month: requestBody.month,
                                    year: requestBody.year});

    LL_Respond(200, response).as_is();

    return;
}

// Deletes an observation from the given list. Expects the request body to be a JSON
// object of the following form,
//
// {
//     token: "...",
//     species: "...",
// }
//
// where 'token' represents token authentication proving that the client has write
// access to the list, 'species' identifies the bird species observed. A list may
// contain at most one observation per species, so no further information is needed
// to identify the observation to be deleted.
async function process_delete({response, database, requestBody})
{
    LL_Assert(((typeof requestBody == "object") &&
               requestBody.hasOwnProperty("token") &&
               requestBody.hasOwnProperty("species")),
              "Malformed request body.");

    await database.delete_observation(requestBody.token,
                                      requestBody.species);

    LL_Respond(200, response).as_is();

    return;
}

// Returns the observations associated with the given list.
async function process_get({response, database})
{
    const observations = await database.get_observations();

    LL_Respond(200, response).json({
        observations,
    });

    return;
}

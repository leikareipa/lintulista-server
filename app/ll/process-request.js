/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const url = require("url");
const {LL_Assert} = require("./assert.js");
const {LL_Respond} = require("./response.js");
const {LL_Database} = require("./database.js");

module.exports = {
    LL_ProcessRequest: process_request,
};

async function process_request(request, response)
{
    const listKey = (url.parse(request.url, true).query.list || null);

    if (!listKey) {
        LL_Respond(400, response).message("Requests must provide the 'list' URL parameter.");
        return;
    }

    const process = (({
        "GET": process_get,
        "PUT": process_put,
        "DELETE": process_delete,
        "OPTIONS": process_options,
    })[request.method] || process_default); 

    try
    {
        const requestBody = await get_request_json_body(request);
        const database = LL_Database(listKey);
        await process({response, database, requestBody});
    }
    catch (error)
    {
        LL_Respond(500, response).message("The request could not be processed.");
        console.error(error);
    }
    
    return;
}

async function process_options({response})
{
    LL_Respond(200, response).allowed_methods("GET, PUT, DELETE, OPTIONS");

    return;
}

async function process_default({response})
{
    LL_Respond(405, response).message("Unknown method.");

    return;
}

// Inserts a new observation into a list. Expects the request body to be a JSON
// object of the following form,
//
// {
//     species: "...",
//     day: x,
//     month: y,
//     year: z,
// }
//
// where 'species' identifies the bird species observed, and 'day'/'month'/'year'
// give the observation's timestamp ('day' is in the range 1-31, 'month' in 1-12).
async function process_put({response, database, requestBody})
{
    LL_Assert(((typeof requestBody == "object") &&
               requestBody.hasOwnProperty("species") &&
               requestBody.hasOwnProperty("day") &&
               requestBody.hasOwnProperty("month") &&
               requestBody.hasOwnProperty("year")),
              "Malformed request body.");

    database.add_observation("TODO",
                             requestBody.species,
                             requestBody.day,
                             requestBody.month,
                             requestBody.year);

    LL_Respond(200, response).as_is();

    return;
}

// Deletes an observation from the given list. Expects the request body to be a JSON
// object of the following form,
//
// {
//     species: "...",
// }
//
// where 'species' identifies the bird species observed. A list may containg at most
// one observation per species, so no further information is needed to identify the
// observation to be deleted.
async function process_delete({response, database, requestBody})
{
    LL_Assert(((typeof requestBody == "object") &&
               requestBody.hasOwnProperty("species")),
              "Malformed request body.");

    database.delete_observation("TODO",
                                requestBody.species,
                                requestBody.day,
                                requestBody.month,
                                requestBody.year);

    LL_Respond(200, response).as_is();

    return;
}

// Returns the observations associated with the given list.
async function process_get({response, database})
{
    const observations = await database.get_observations();

    LL_Respond(200, response).json({
        data: observations,
    });

    return;
}

// Fetches the given request's JSON body. Resolves with the body on success;
// rejects with an error string otherwise.
async function get_request_json_body(request)
{
    return new Promise((resolve, reject)=>{
        let requestBodyBuffer = "";
        
        request.setEncoding("utf8");
        request.on("data", append_data_to_buffer);
        request.on("end", finish);

        function append_data_to_buffer(bufferPart)
        {
            const maxBufferLength = (.1/*MB*/ * 1024 * 1024);

            requestBodyBuffer += bufferPart;

            if (requestBodyBuffer.length > maxBufferLength)
            {
                reject("Overflowing the request body buffer.");
            }

            return;
        }

        function finish()
        {
            if (!requestBodyBuffer.length)
            {
                resolve({});
                return;
            }

            try
            {
                const bodyJson = JSON.parse(requestBodyBuffer);
                resolve(bodyJson);
            }
            catch (error)
            {
                reject("Malformed JSON in the request body.");
            }
        }
    });
}

/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

require("http");
const url = require("url");
const {LL_Database} = require("./database-interface.js");

module.exports = {
    LL_ProcessRequest: process_request,
};

async function process_request(request, response)
{
    const requestProcessorFunctions = {
        "GET": process_get,
        "PUT": process_put,
        "DELETE": process_delete,
        "OPTIONS": process_options,
    };

    const process_fn = (requestProcessorFunctions[request.method] || process_default);
    
    return await process_fn(request, response);
}

async function process_options(request, response)
{
    response.writeHead(200, {
        "content-type": "text/plain",
        "Access-Control-Allow-Origin": "http://localhost:8002",
        "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    });

    response.end();
}

async function process_default(request, response)
{
    response.writeHead(405, {
        "content-type": "text/plain",
    });

    response.end("Unknown method.\n");

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
async function process_put(request, response)
{
    const listKey = (url.parse(request.url, true).query.list || null);

    if (!listKey)
    {
        response.writeHead(400, {
            "content-type": "text/plain",
        });

        response.end("The request is missing the required parameter 'list'.");

        return;
    }

    try
    {
        const body = await get_request_json_body(request);

        if (!LL_Database.add_observation(listKey,
                                         "TODO",
                                         body.species,
                                         body.day,
                                         body.month,
                                         body.year))
        {
            throw new Error("Database error.");
        }

        response.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:8002",
        });

        response.end(JSON.stringify({
            valid: true,
        }));
    }
    catch (error)
    {
        response.writeHead(400, {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:8002",
        });

        response.end(JSON.stringify({
            valid: false,
            message: "The observation could not be added.",
        }));

        console.log(error);
    }

    return;
}

// Deletes an observation from the given list.
async function process_delete(request, response)
{
    const listKey = (url.parse(request.url, true).query.list || null);

    if (!listKey)
    {
        response.writeHead(400, {
            "content-type": "text/plain",
        });

        response.end("The request is missing the required parameter 'list'.");

        return;
    }

    try
    {
        const body = await get_request_json_body(request);

        if (!LL_Database.delete_observation(listKey,
                                            "TODO",
                                            body.species,
                                            body.day,
                                            body.month,
                                            body.year))
        {
            throw new Error("Database error.");
        }

        response.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:8002",
        });

        response.end(JSON.stringify({
            valid: true,
        }));
    }
    catch (error)
    {
        response.writeHead(400, {
            "content-type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:8002",
        });

        response.end(JSON.stringify({
            valid: false,
            message: "The observation could not be removed.",
        }));

        console.log(error);
    }
    
    return;
}

// Returns the observations associated with the given list.
async function process_get(request, response)
{
    const listKey = (url.parse(request.url, true).query.list || null);

    if (!listKey)
    {
        response.writeHead(400, {
            "content-type": "text/plain",
        });

        response.end("The request is missing the required parameter 'list'.");

        return;
    }

    const observations = await LL_Database.get_observations(listKey);

    if (observations !== false)
    {
        response.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:8002",
        });

        response.end(JSON.stringify({
            valid: true,
            data: observations,
        }));
    }
    else
    {
        response.writeHead(500, {
            "content-type": "text/plain",
            "Access-Control-Allow-Origin": "http://localhost:8002",
        });

        response.end("Database error.");

        return;
    }

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

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
    };

    const process_fn = (requestProcessorFunctions[request.method] || process_default);
    
    return await process_fn(request, response);
}

async function process_default(request, response)
{
    response.writeHead(405, {
        "content-type": "text/plain",
    });

    response.end("Unknown method.\n");

    return;
}

// Inserts a new observation into the given list.
async function process_put(request, response)
{
    response.writeHead(501, {
        "content-type": "text/plain",
    });

    response.end();
}

// Deletes an observation from the given list.
async function process_delete(request, response)
{
    response.writeHead(501, {
        "content-type": "text/plain",
    });

    response.end();
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

        response.end("The request is missing a required parameter.");

        return;
    }

    response.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:8002",
    });

    const observations = await LL_Database.get_observations(listKey);

    response.end(JSON.stringify({
        valid: true,
        data: observations,
    }));

    return;
}

/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

module.exports = {
    process_request,
};

require("http");
const url = require("url");
const {Database} = require("./database.js");

function process_request(request, response)
{
    (({
        "GET": process_get,
        "PUT": process_put,
        "POST": process_post,
        "DELETE": process_delete,
    })[request.method] || process_default)(request, response);

    return;
}

function process_default(request, response)
{
    response.writeHead(405, {
        "content-type": "text/plain",
    });

    response.end("Unknown method.\n");

    return;
}

// Inserts a new observation into the given list.
function process_put(request, response)
{
    response.writeHead(501, {
        "content-type": "text/plain",
    });

    response.end();
}

// Creates a new list.
function process_post(request, response)
{
    response.writeHead(501, {
        "content-type": "text/plain",
    });

    response.end();
}

// Deletes an observation from the given list.
function process_delete(request, response)
{
    response.writeHead(501, {
        "content-type": "text/plain",
    });

    response.end();
}

// Returns the observations associated with the given list.
function process_get(request, response)
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
        "content-type": "application/json",
    });

    const observations = Database.get_observations(listKey);

    response.end(JSON.stringify(observations));

    return;
}

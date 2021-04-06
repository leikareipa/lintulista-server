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

module.exports = {
    LL_ProcessRequest: process_request,
};

// These routes's keys are matched to the request URL to decide which route's
// processor function should handle the request.
const routes = {
    "/": require("./route-root.js").route,
    "/login": require("./route-login.js").route,
};

async function process_request(request, response)
{
    try
    {
        const listKey = (url.parse(request.url, true).query.list || null);

        if (listKey === null) {
            LL_Respond(400, response).message("Requests must provide the 'list' URL parameter.");
            return;
        }

        const requestBody = await get_request_json_body(request);
        const requestMethod = request.method;
        const routeUrl = (url.parse(request.url).pathname || null);
        const router_fn = (routes[routeUrl] || default_route);

        await router_fn({
            listKey,
            requestBody,
            requestMethod,
            response,
        });
    }
    catch (error)
    {
        LL_Respond(500, response).message("The request could not be successfully processed.");
        console.error(error);
    }

    return;
}

async function default_route({response})
{
    LL_Respond(404, response).message("Resource not found.");

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

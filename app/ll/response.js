/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const http = require("http");
const {LL_Assert} = require("./assert.js");

module.exports = {
    LL_Respond: populate_http_response,
};

// Provides convenience functions for populating Node's HTTP responses in
// a way compatible with what the Lintulista client expects to receive.
//
// SAMPLE USAGE:
//
//   - In these samples, 'response' is the response object received by the
//     callback function to http.createServer().
//
//   - Send a HTML status code of 200 with no further data:
//
//       LL_Respond(200, response).as_is();
//
//   - Report an error:
//
//       LL_Respond(400, response).message("Something went wrong.");
//
//   - Provide JSON data:
//
//       LL_Respond(200, response).json({
//           data: [1, 2, 3],
//           otherData: "Hello there",
//       });
//
// WARNING: Calling LL_Respond(...) alone - without e.g. .json(...) - will
// leave the response in an unfinished state.
//
function populate_http_response(htmlResponseCode = 200,
                                response = http.ServerResponse)
{
    LL_Assert(("LL_CLIENT_ORIGIN" in process.env),
              "Missing a required environment variable.");

    response.statusCode = htmlResponseCode;
    response.setHeader("Access-Control-Allow-Origin", process.env.LL_CLIENT_ORIGIN);

    const publicInterface = {
        json: function(jsonObject = {})
        {
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({
                data: {...jsonObject},
                valid: (htmlResponseCode < 400),
            }));

            return;
        },

        allowed_methods: function(methodsAllowed = "GET, PUT")
        {
            response.setHeader("Access-Control-Allow-Methods", methodsAllowed);
            
            return this.json({});
        },

        as_is: function()
        {
            return this.json({});
        },

        message: function(messageString = "Unspecified error")
        {
            return this.json({
                message: messageString,
            });
        }
    };

    return publicInterface;
}

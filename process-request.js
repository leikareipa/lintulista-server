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
const {Observation} = require("./observation.js");

function process_request(request, response)
{
    switch (request.method)
    {
        case "GET":
        {
            response.writeHead(200, {
                "content-type": "application/json",
            });

            const obsString = Observation.encode_to_string("Japaninnokkavarpunen", 31, 6, 2021);
            const obs = Observation.decode_from_string(obsString);

            obs.string = obsString;

            response.end(JSON.stringify(obs));

            break;
        }
        default:
        {
            response.writeHead(404, {
                "content-type": "text/plain",
            });

            response.end("Unknown method.\n");

            break;
        }
    }

    return;
}

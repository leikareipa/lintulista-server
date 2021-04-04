/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

module.exports = {
    Database: factory_Database(),
};

const {Observation} = require("./observation.js");

function factory_Database()
{
    const publicInterface = {
        get_observations(listKey = "")
        {
            /// TODO. Dummy implementation for now.
            const observationsString =
                "/bG.GM"+
                "/?))GM"+
                "(65/GM"+
                ".WE*GM"+
                ".c*2GM";

            const observations = Observation.decode_from_string(observationsString);

            return observations;
        }
    };

    return publicInterface;
}

/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const {LL_Assert} = require("./assert.js");

module.exports = {
    LL_TimestampNow: make_timestamp_now,
    LL_IsTimestampValid: is_timestamp_valid,
};

// Returns a seconds-based Unix epoch timestamp.
function make_timestamp_now()
{
    const timestamp = Math.ceil(Date.now() / 1000.0);

    LL_Assert(is_timestamp_valid(timestamp), "Invalid timestamp.");
    
    return timestamp;
}

function is_timestamp_valid(timestamp)
{
    return ((typeof timestamp === "number") &&
            !Number.isNaN(timestamp));
}

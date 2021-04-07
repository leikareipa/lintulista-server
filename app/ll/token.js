/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const crypto = require("crypto");
const {LL_Assert} = require("./assert.js");

module.exports = {
    LL_GenerateToken: generate_token,
    LL_IsTokenWellFormed: is_token_well_formed,
};

const tokenLength = 30;

function generate_token()
{
    const randomBytes = crypto.randomBytes(tokenLength);
    const randomString = randomBytes.reduce((string, b)=>{
        const idx = (33 + (b % 90));
        return (string + String.fromCharCode(idx));
    }, "").replace(/[\\]/g, "_")
          .replace(/[\']/g, ":")
          .replace(/[\"]/g, "y")
          .replace(/[\`]/g, "3");

    LL_Assert((randomString.length >= tokenLength),
              "Generated an invalid token.");

    return randomString;
}

function is_token_well_formed(tokenCandidate = "")
{
    return ((typeof tokenCandidate === "string") &&
            (tokenCandidate.length === tokenLength));
}

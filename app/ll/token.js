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
    const randomToken = randomBytes.reduce((string, b)=>{
        const idx = (33 + (b % 90));
        return (string + String.fromCharCode(idx));
    }, "").replace(/[\\]/g, "_")
          .replace(/[\']/g, ":")
          .replace(/[\"]/g, "y")
          .replace(/[\`]/g, "3");

    LL_Assert(is_token_well_formed(randomToken),
              "Generated an invalid token.");

    return randomToken;
}

function is_token_well_formed(tokenCandidate = "")
{
    return ((typeof tokenCandidate === "string") &&
            (tokenCandidate.length === tokenLength));
}

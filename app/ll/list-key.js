/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

module.exports = {
    LL_IsListKeyValid: is_list_key_valid,
};

const fixedKeyLength = 9;

function is_list_key_valid(listKeyCandidate = "")
{
    return ((typeof listKeyCandidate === "string") &&
            (listKeyCandidate.length === fixedKeyLength) &&
            (listKeyCandidate.match(/[^a-zA-Z]/) === null));
}

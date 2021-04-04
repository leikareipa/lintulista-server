/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

module.exports = {
    assert,
};

function assert(condition, failMessage)
{
    if (!condition)
    {
        throw new Error(failMessage);
    }

    return;
}

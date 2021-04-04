/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

module.exports = {
    UintStringer: factory_UintStringer(),
};

const {assert} = require("./assert.js");

// Provides an encoding of unsigned integers into/from ASCII strings; e.g. 161 -> "*I" -> 161.
function factory_UintStringer()
{
    // The range of possible ASCII symbols with which values are to be represented.
    const numBits = 6;
    const firstCharCode = '('.charCodeAt(0);
    const lastCharCode = (firstCharCode + (1 << numBits) - 1);

    const publicInterface = {
        // Returns a conversion of the given unsigned integer into a string of the
        // given length.
        uint2string: function(int = 0, length = 0)
        {
            assert((int >= 0) &&
                   (length > 0),
                   "Malformed arguments.");

            const string = new Array(length).fill(String.fromCharCode(firstCharCode));

            while (int)
            {
                --length;
                assert((length >= 0), "Overflowing value-to-string conversion.");
        
                const char = String.fromCharCode(firstCharCode + (int & ((1 << numBits) - 1)));
                string[length] = char;
        
                int >>= numBits;
            }

            return string.join("");
        },

        // Returns a conversion of the given unsigned integers into a string. The
        // argument must be an array of the following form,
        //
        // [
        //     [x, y],
        //     [x, y],
        //     ...
        // ]
        //
        // where each sub-array provides the value to be converted (y) and the
        // desired length of the resulting string (x).
        uints2string: function(ints = [])
        {
            return ints.map(e=>this.uint2string(e[1], e[0])).join("");
        },

        // Returns a conversion of the given string (obtained from uints2string()) into an
        // array of unsigned integers. The 'lengths' argument is an array giving the lengths
        // of the string's sub-strings, corresponding in order to the initial call to
        // uints2string().
        string2uints: function(string = "", lengths = [])
        {
            assert((string.length == lengths.reduce((totalLen, len)=>totalLen+len)),
                   "Malformed string.");

            const ints = [];
            string = string.split("");

            while (lengths.length && string.length)
            {
                let int = 0;
                const length = lengths.shift();
                const substring = string.splice(0, length);

                for (let i = 0; i < length; i++)
                {
                    const value = (substring.pop().charCodeAt(0) - firstCharCode);
                    int |= (value << (i * numBits));
                }

                ints.push(int);
            }

            return ints;
        }
    };

    return publicInterface;
}

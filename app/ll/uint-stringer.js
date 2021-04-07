/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const {LL_Assert} = require("./assert.js");

module.exports = {
    LL_UintStringer: generate_uint_stringer_interface(),
};

// Provides an encoding of unsigned integers into/from ASCII strings; e.g. 161 -> "*I" -> 161.
function generate_uint_stringer_interface()
{
    // The range of possible ASCII symbols with which values are to be represented.
    const numBits = 6;
    const firstCharCode = '('.charCodeAt(0);
    const lastCharCode = (firstCharCode + (1 << numBits) - 1);
    const leftPadSymbol = "#";

    LL_Assert((lastCharCode > firstCharCode), "Invalid last char code.");

    LL_Assert((leftPadSymbol.charCodeAt(0) < firstCharCode),
              "The empty symbol is in a reserved range.");

    const publicInterface = {
        // Returns a conversion of the given unsigned integer into a string of the
        // given length.
        uint2string: function(uint = 0, length = 0)
        {
            LL_Assert((Math.round(uint) === uint) &&
                      (uint >= 0) &&
                      (length > 0),
                      "Malformed arguments.");

            const string = new Array(length).fill(leftPadSymbol);

            do
            {
                --length;
                LL_Assert((length >= 0), "Overflowing value-to-string conversion.");
        
                const char = String.fromCharCode(firstCharCode + (uint & ((1 << numBits) - 1)));
                string[length] = char;
        
                uint >>= numBits;
            }
            while (uint);

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
            LL_Assert((string.length == lengths.reduce((totalLen, len)=>totalLen+len)),
                      "Mismatched lengths array for string.");

            const ints = [];
            string = string.split("");

            while (lengths.length && string.length)
            {
                let int = 0;
                const length = lengths.shift();
                const substring = string.splice(0, length);

                for (let i = 0; i < length; i++)
                {
                    const chr = substring.pop();

                    if (chr === leftPadSymbol) {
                        break;
                    }

                    const value = (chr.charCodeAt(0) - firstCharCode);
                    int |= (value << (i * numBits));
                }

                ints.push(int);
            }

            return ints;
        }
    };

    return publicInterface;
}

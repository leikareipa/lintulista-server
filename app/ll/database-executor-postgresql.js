/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const {Client: PSQLClient} = require("pg");
const {LL_Assert} = require("./assert.js");

module.exports = {
    instance: create_postgresql_executor,
};

// Creates a Lintulista database executor interface that provides facilities for
// executing database queries in PostgreSQL.
//
// This interface is intended to be used by Lintulista's database interface
// and not directly by external code.
function create_postgresql_executor()
{
    LL_Assert((("LL_PSQL_USER" in process.env) &&
               ("LL_PSQL_HOST" in process.env) &&
               ("LL_PSQL_DATABASE" in process.env) &&
               ("LL_PSQL_PASSWORD" in process.env)),
              "Missing one or more required environment variable(s).");

    const client = new PSQLClient({
        user: process.env.LL_PSQL_USER,
        host: process.env.LL_PSQL_HOST,
        database: process.env.LL_PSQL_DATABASE,
        password: process.env.LL_PSQL_PASSWORD,
        port: 5432,
    });
    
    client.connect();

    const publicInterface = {
        // Returns the full observations string (e.g. "/bG.GM/?))GM(65/GM.WE*GM.c*2GM")
        // associated with the given list.
        //
        // Throws on error; caller should catch.
        // Caller is responsible for argument validation.
        get_observations_string: async function(listKey = "")
        {
            const text = "SELECT observations FROM lintulista WHERE key = $1";
            const values = [listKey];
            const response = await client.query(text, values);

            LL_Assert(((response.rows.length == 1) &&
                       response.rows[0].hasOwnProperty("observations") &&
                       (typeof response.rows[0].observations == "string")),
                      "Malformed database response.");

            return response.rows[0].observations;
        },

        // Appends the given observations string to the given list's observations.
        //
        // Throws on error; caller should catch.
        // Caller is responsible for argument validation.
        append_to_observations: async function(observationString = "", listKey = "")
        {
            /// TODO: User built-in PostgreSQL syntax to append the string.
            const oldObservationsString = await this.get_observations_string(listKey);
            const newObservationsString = (oldObservationsString + observationString);

            const text = "UPDATE lintulista SET observations = $2 WHERE key = $1";
            const values = [listKey, newObservationsString];
            await client.query(text, values);

            return true;
        },

        // Removes the first instance of the given observation from the given list's
        // observations.
        //
        // Throws on error; caller should catch.
        // Caller is responsible for argument validation.
        remove_from_observations: async function(observationString = "", listKey = "")
        {
            /// TODO: User built-in PostgreSQL syntax to remove the substring.
            const oldObservationsString = await this.get_observations_string(listKey);
            const newObservationsString = oldObservationsString.replace(observationString, "");

            const text = "UPDATE lintulista SET observations = $2 WHERE key = $1";
            const values = [listKey, newObservationsString];
            await client.query(text, values);

            return true;
        },
    };

    return publicInterface;
}

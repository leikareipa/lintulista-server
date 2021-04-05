/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

require("dotenv").config();
const {Client: PSQLClient} = require("pg");

module.exports = {
    LL_DatabaseExecutor: generate_postgresql_executor(),
};

// Executes database queries in PostgreSQL.
function generate_postgresql_executor()
{
    const client = new PSQLClient({
        user: process.env.PSQL_USER,
        host: process.env.PSQL_HOST,
        database: process.env.PSQL_DATABASE,
        password: process.env.PSQL_PASSWORD,
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

            if (response.rows.length != 1){
                throw new RangeError("Invalid list key.");
            }

            if (!response.rows[0].hasOwnProperty("observations")) {
                throw new Error("Malformed database response; missing expected property 'observations'.");
            }

            const observationsString = response.rows[0].observations;

            if (typeof observationsString !== "string") {
                throw new TypeError("Malformed database response; expected 'observations' to be a string.");
            }

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

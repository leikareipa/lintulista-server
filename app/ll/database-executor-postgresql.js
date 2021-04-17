/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const {Client: PSQLClient} = require("pg");
const {LL_Assert} = require("./assert.js");
const util = require("util")

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
    LL_Assert(("DATABASE_URL" in process.env),
              "Missing one or more required environment variable(s).");

    const client = new PSQLClient({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    client.connect();

    const publicInterface = {
        // Returns the value of the given column in the given list.
        //
        // Throws on error; caller should catch.
        // Caller is responsible for argument validation.
        get_column_value: async function(columnName = "", listKey = "")
        {
            const text = `SELECT ${columnName} FROM lintulista WHERE key = $1`;
            const values = [listKey];
            const response = await client.query(text, values);

            LL_Assert(((response.rows.length == 1) &&
                       response.rows[0].hasOwnProperty(columnName)),
                      `Malformed column reponse:
                        column="${columnName}"
                        key="${listKey}"
                        response=${util.inspect(response)}`);

            return response.rows[0][columnName];
        },

        // Throws on error; caller should catch.
        // Caller is responsible for argument validation.
        set_column_value: async function(columnName = "", newValue, listKey = "")
        {
            const text = `UPDATE lintulista SET ${columnName} = $2 WHERE key = $1`;
            const values = [listKey, newValue];
            await client.query(text, values);
            
            return;
        },
    };

    return publicInterface;
}

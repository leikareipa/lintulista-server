/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const {Pool: PSQLPool} = require("pg");
const {LL_Assert} = require("./assert.js");
const util = require("util");

module.exports = {
    LL_DBExecutor: postgresql_executor(),
};

// Creates a Lintulista database executor interface that provides facilities for
// executing database queries in PostgreSQL.
//
// This interface is intended to be used by Lintulista's database interface
// and not directly by other parts of the codebase.
function postgresql_executor()
{
    LL_Assert(("DATABASE_URL" in process.env),
              "Missing one or more required environment variable(s).");

    const connectionPool = new PSQLPool({
        connectionString: process.env.DATABASE_URL,
        ssl: {rejectUnauthorized: false}
    });

    /// TODO: Handle the error in some way, if pg has some way of doing it.
    connectionPool.on("error", (error)=>{
        console.error(error); 
    });
    
    const publicInterface = {
        // Throws on error; caller should catch.
        // Caller is responsible for argument validation.
        get_column_value: async function(columnName = "", listKey = "")
        {
            LL_Assert((connectionPool instanceof PSQLPool), "Connection pool not initialized.");

            let client;

            try
            {
                const text = `SELECT ${columnName} FROM lintulista WHERE key = $1`;
                const values = [listKey];

                client = await connectionPool.connect();
                const response = await client.query(text, values);

                LL_Assert(((response.rows.length == 1) &&
                           response.rows[0].hasOwnProperty(columnName)),
                          `Invalid database response to column query:
                              column="${columnName}"
                              list key="${listKey}"
                              response=${util.inspect(response)}`);

                return response.rows[0][columnName];
            }
            finally
            {
                if ((typeof client === "object") &&
                    (typeof client.release === "function"))
                {
                    client.release();
                }
                else {
                    console.warn("Uninitialized pg client.");
                }
            }
        },

        // Throws on error; caller should catch.
        // Caller is responsible for argument validation.
        set_column_value: async function(columnName = "", newValue, listKey = "")
        {
            LL_Assert((connectionPool instanceof PSQLPool), "Client not initialized.");

            let client;

            try
            {
                const text = `UPDATE lintulista SET ${columnName} = $2 WHERE key = $1`;
                const values = [listKey, newValue];

                client = await connectionPool.connect();
                await client.query(text, values);
            }
            finally
            {
                if ((typeof client === "object") &&
                    (typeof client.release === "function"))
                {
                    client.release();
                }
            }
        },
    };

    return publicInterface;
}

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

    };

    return publicInterface;
}

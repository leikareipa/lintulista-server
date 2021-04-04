/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const http = require("http");

const {process_request} = require("./process-request.js");

const server = http.createServer(process_request);
server.listen(8080, ()=>console.log("Listening"));

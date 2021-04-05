/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const http = require("http");
const {LL_ProcessRequest} = require("./ll/process-request.js");

const server = http.createServer(LL_ProcessRequest);
server.listen(process.env.PORT || 8080);

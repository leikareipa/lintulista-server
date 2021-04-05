/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

require("dotenv").config();
const http = require("http");
const {LL_ProcessRequest} = require("./ll/process-request.js");

const server = http.createServer(LL_ProcessRequest);
server.listen(process.env.PORT || 8080);

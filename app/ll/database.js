/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const bcrypt = require("bcrypt");
const {LL_DBExecutor} = require("./database-executor-postgresql.js");
const {LL_Assert} = require("./assert.js");
const {LL_Observation} = require("./observation.js");
const {LL_TimestampNow,
       LL_IsTimestampValid} = require("./timestamp.js");
const {LL_GenerateToken,
       LL_IsTokenWellFormed} = require("./token.js");
const {LL_IsListKeyValid} = require("./list-key.js");

module.exports = {
    LL_Database: list_database_accessor,
};

const dbConstants = {
    minUsernameLength: 5,
    maxUsernameLength: 30,
    minPlaintextPasswordLength: 10,
    maxPlaintextPasswordLength: 30,
    minPasswordHashLength: 60,
    maxPasswordHashLength: 255,
    numHoursTokenValid: 6,
};

// Provides an interface for interacting with Lintulista's database. Database
// access is always directed at a particular list, whose key is given as an
// argument to LL_Database().
//
// Throws on error.
//
// This interface makes use of a database executor, which establishes a connection
// to the database on server launch. The connection will remain open for the
// duration of the server's operation; multiple consecutive calls to LL_Database()
// won't result in multiple connections to the database.
//
// SAMPLE USAGE:
//
//   1. Connect to a list in the database. This will throw on error.
//
//       const listDatabase = LL_Database("list-key");
//
//   2. Get all observations in the list. This will throw on error.
//
//       const observations = await listDatabase.get_observations();
// 
function list_database_accessor(listKey = "")
{
    LL_Assert(LL_IsListKeyValid(listKey),
              "Invalid list key for database access.");

    const publicInterface = {
        // Returns true if the list key with which this interface was created exists
        // in the database; false otherwise (including on any unrelated errors)
        does_list_exist: async function()
        {
            try {
                const keyInDb = await LL_DBExecutor.get_column_value("key", listKey);
                return (keyInDb === listKey);
            }
            catch (error) {
                return false;
            }
        },
        // Logs the user out of the list. Throws on error.
        logout: async function(token = "")
        {
            LL_Assert(await validate_token(token),
                      "Attempted to use an invalid token to log out.");

            await reset_list_token();

            return;
        },
        
        // Returns an object containing the login token on success; false otherwise.
        login: async function(username = "", plaintextPassword = "")
        {
            LL_Assert(is_valid_username_string(username) &&
                      is_valid_plaintext_password_string(plaintextPassword),
                      "Invalid login credentials.");

            const listUsername = await LL_DBExecutor.get_column_value("username", listKey);
            const listPasswordHash = await LL_DBExecutor.get_column_value("password_hash", listKey);
            const isCorrectPassword = await bcrypt.compare(plaintextPassword, listPasswordHash);

            // Note: The password hashes are compared whether the username is correct
            // or not, so as not to have computing time leak info on whether a username
            // was correct even if the password wasn't.

            if ((listUsername === username) &&
                (isCorrectPassword === true))
            {
                const token = LL_GenerateToken();
                const until = (LL_TimestampNow() + (dbConstants.numHoursTokenValid * 60 * 60));

                await LL_DBExecutor.set_column_value("token", token, listKey);
                await LL_DBExecutor.set_column_value("token_valid_until", until, listKey);
                
                return {token, until};
            }
            else {
                return false;
            }

            function is_valid_username_string(proposedString)
            {
                return ((typeof proposedString === "string") &&
                        (proposedString.length >= dbConstants.minUsernameLength) &&
                        (proposedString.length <= dbConstants.maxUsernameLength));
            }

            function is_valid_plaintext_password_string(proposedString)
            {
                return ((typeof proposedString === "string") &&
                        (proposedString.length >= dbConstants.minPlaintextPasswordLength) &&
                        (proposedString.length <= dbConstants.maxPlaintextPasswordLength));
            }
        },

        // Fetches and returns all of the observations in the given list. Returns an
        // array containing the observations. Throws on failure.
        get_observations: async function()
        {
            const observationsString = await LL_DBExecutor.get_column_value("observations", listKey);
            const observations = LL_Observation.decode_from_string(observationsString);
            return observations;
        },

        // Adds the given observation into the given list. Throws on failure.
        add_observation: async function(token = "",
                                        {species = "",
                                         day = 0,
                                         month = 0,
                                         year = 0})
        {
            LL_Assert(await validate_token(token),
                      "Attempted to use an invalid token to add an observation.");

            // If an observation of this species already exists in the list, well overwrite
            // it with the new observation data (we assume the user wants to e.g. change
            // the observation date).
            if (await this.is_species_on_list(species)) {
                await this.delete_observation(token, species);
            }

            const newObservationString = LL_Observation.encode_to_string({species, day, month, year});
            const observationsString = await LL_DBExecutor.get_column_value("observations", listKey);
            const concatenated = (observationsString + newObservationString);

            await LL_DBExecutor.set_column_value("observations", concatenated, listKey);

            return;
        },

        // Removes the first observation of the given species from the list. Note that a
        // list can contain at most one observation per species, so the observation date
        // isn't needed. Throws on failure.
        delete_observation: async function(token = "",
                                           species = "")
        {
            LL_Assert(await validate_token(token),
                      "Attempted to use an invalid token to delete an observation.");

            const observations = await this.get_observations();
            const targetObservation = observations.find(o=>o.species==species);

            LL_Assert((targetObservation !== undefined),
                      "Attempted to use an invalid token to delete an observation.");

            const targetObservationString = LL_Observation.encode_to_string(targetObservation);
            const observationsString = await LL_DBExecutor.get_column_value("observations", listKey);
            const removed = observationsString.replace(targetObservationString, "");

            await LL_DBExecutor.set_column_value("observations", removed, listKey);

            return;
        },

        is_species_on_list: async function(species = "")
        {
            const observations = await this.get_observations(listKey);
            return (observations.find(o=>o.species==species) !== undefined);
        }
    };

    return publicInterface;

    async function reset_list_token()
    {
        await LL_DBExecutor.set_column_value("token", "", listKey);
        await LL_DBExecutor.set_column_value("token_valid_until", 0, listKey);
        return;
    }
    
    // Returns true if the given token is valid; false otherwise. Throws on failure.
    // If the token is valid, this function has the side effect of resetting the db-side
    // token to null if it has timed out (in which case false is also returned).
    async function validate_token(proposedToken = "")
    {
        // Verify that the token is valid for this list.
        {
            const listToken = await LL_DBExecutor.get_column_value("token", listKey);

            if (!LL_IsTokenWellFormed(proposedToken) ||
                !LL_IsTokenWellFormed(listToken))
            {
                return false;
            }

            if (proposedToken !== listToken)
            {
                return false;
            }
        }

        // Validate token timeout. At this point, we've found the proposed token to
        // be valid; now we just need to be sure that it hasn't timed out.
        {
            const listTokenValidUntil = Number(await LL_DBExecutor.get_column_value("token_valid_until", listKey));

            LL_Assert(LL_IsTimestampValid(listTokenValidUntil),
                      "Detected a malformed timestamp in the database.");

            // If the token has timed out.
            if (LL_TimestampNow() > listTokenValidUntil)
            {
                await reset_list_token();
                return false;
            }
        }

        return true;
    }
}

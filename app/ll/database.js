/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const {LL_Observation} = require("./observation.js");
const {LL_Assert} = require("./assert.js");
const dbExecutor = require("./database-executor-postgresql.js").instance();

module.exports = {
    LL_Database: connect_to_list_in_database,
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
//   1. Connect to a list in the database.
//
//       const database = LL_Database("list-key");
//
//   2. Get all observations in the list.
//
//       const observations = database.get_observations();
// 
function connect_to_list_in_database(listKey = "")
{
    LL_Assert(is_list_key_valid(listKey), "Invalid list key.");

    const publicInterface = {
        // Fetches and returns all of the observations in the given list. Returns an
        // array containing the observations; or false on error.
        get_observations: async function()
        {
            const observationsString = await dbExecutor.get_observations_string(listKey);
            const observations = LL_Observation.decode_from_string(observationsString);
            return observations;
        },

        // Adds the given observation into the given list. Throws on failure.
        add_observation: async function(editToken = "",
                                        species = "",
                                        day = 0,
                                        month = 0,
                                        year = 0)
        {
            LL_Assert(is_edit_token_valid(editToken, listKey),
                      "Attempting to use an invalid token to add an observation.");

            LL_Assert(!(await this.is_species_on_list(species)),
                      "Attempting to add a duplicate observation.");

            const observationString = LL_Observation.encode_to_string({species, day, month, year});
            await dbExecutor.append_to_observations(observationString, listKey);

            return;
        },

        // Removes the observation of the given species from the list. Note that a given list
        // can contain at most one observation per species, so the observation date isn't
        // needed.
        delete_observation: async function(editToken = "",
                                           species = "")
        {
            LL_Assert(is_edit_token_valid(editToken, listKey),
                      "Attempting to use an invalid token to delete an observation.");

            const observations = await this.get_observations(listKey);
            const targetObservation = observations.find(o=>o.species==species);

            LL_Assert((targetObservation !== undefined),
                      "Attempting to use an invalid token to delete an observation.");

            const observationString = LL_Observation.encode_to_string(targetObservation);
            await dbExecutor.remove_from_observations(observationString, listKey);

            return;
        },

        is_species_on_list: async function(species = "")
        {
            const observations = await this.get_observations(listKey);
            return (observations.find(o=>o.species==species) !== undefined);
        }
    };

    return publicInterface;

    function is_list_key_valid(editToken = "", listKey = "")
    {
        /// TODO.

        return true;
    }
    
    function is_edit_token_valid(editToken = "", listKey = "")
    {
        /// TODO.

        return true;
    }
}

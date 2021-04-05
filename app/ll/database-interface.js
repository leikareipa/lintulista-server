/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const {LL_Observation} = require("./observation-interface.js");
const {LL_DatabaseExecutor} = require("./database-executor-postgresql.js");

module.exports = {
    LL_Database: generate_database_interface(),
};

function generate_database_interface()
{
    const publicInterface = {
        // Fetches and returns all of the observations in the given list. Returns an
        // array containing the observations; or false on error.
        get_observations: async function(listKey = "")
        {
            try
            {
                const observationsString = await LL_DatabaseExecutor.get_observations_string(listKey);
                const observations = LL_Observation.decode_from_string(observationsString);
                return observations;
            }
            catch (error)
            {
                console.error(error);
                return false;
            }
        },

        // Adds the given observation into the given list. Returns true on success; false otherwise.
        add_observation: async function(listKey = "",
                                        editToken = undefined,
                                        species = "",
                                        day = 0,
                                        month = 0,
                                        year = 0)
        {
            try
            {
                if (!is_edit_token_valid(editToken, listKey)) {
                    throw new Error("Attempting to use an invalid token to add an observation.");
                }

                if (await this.is_species_on_list(species, listKey)) {
                    throw new Error("Attempting to add a duplicate observation.");
                }

                const observationString = LL_Observation.encode_to_string({species, day, month, year});
                return await LL_DatabaseExecutor.append_to_observations(observationString, listKey);
            }
            catch (error)
            {
                console.error(error);
                return false;
            }
        },

        // Removes the observation of the given species from the list. Note that a given list
        // can contain at most one observation per species, so the observation date isn't
        // needed.
        delete_observation: async function(listKey = "",
                                           editToken = undefined,
                                           species = "")
        {
            if (!is_edit_token_valid(editToken, listKey)) {
                throw new Error("Attempting to use an invalid token to delete an observation.");
            }

            const observations = await this.get_observations(listKey);
            const targetObservation = observations.find(o=>o.species==species);

            if (targetObservation)
            {
                try
                {
                    const observationString = LL_Observation.encode_to_string(targetObservation);
                    return await LL_DatabaseExecutor.remove_from_observations(observationString, listKey);
                }
                catch (error)
                {
                    console.error(error);
                    return false;
                }
            }

            return false;
        },

        is_species_on_list: async function(species = "",
                                           listKey = "")
        {
            const observations = await this.get_observations(listKey);
            return (observations.find(o=>o.species==species) !== undefined);
        }
    };

    return publicInterface;

    function is_edit_token_valid(editToken = "", listKey = "")
    {
        /// TODO.

        return true;
    }
}

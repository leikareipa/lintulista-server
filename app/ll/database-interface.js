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
        get_observations: async function(listKey = "")
        {
            /// TODO. Dummy implementation for now.
            const observationsString =
                "/bG.GM"+
                "/?))GM"+
                "(65/GM"+
                ".WE*GM"+
                ".c*2GM";

            const observations = LL_Observation.decode_from_string(observationsString);

            return observations;
        },

        put_observation: async function(listKey = "", editToken = undefined, species = "", day = 0, month = 0, year = 0)
        {
            if (!is_edit_token_valid(editToken, listKey))
            {
                return false;
            }

            if (this.is_species_on_list(species, listKey))
            {
                return false;
            }

            return true;
        },

        delete_observation: async function(listKey = "", editToken = undefined, species = "")
        {
            if (!is_edit_token_valid(editToken, listKey))
            {
                return false;
            }

            if (!this.is_species_on_list(species, listKey))
            {
                return false;
            }

            return true;
        },

        is_species_on_list: async function(species = "", listKey = "")
        {
            return (undefined !== this.get_observations(listKey).find(o=>o.species==species));
        }
    };

    return publicInterface;

    function is_edit_token_valid(editToken = "", listKey = "")
    {
        return false;
    }
}

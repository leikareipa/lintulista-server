/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista's server
 * 
 */

"use strict";

const {LL_Assert} = require("../../assert.js");
const {LLTest_ExpectThrow,
       LLTest_ExpectThrowAsync,
       LLTest_ExpectTrueAsync,
       LLTest_ExpectTrue} = require("../test-assert.js");
const {LL_IsTokenWellFormed} = require("../../token.js");
const {LL_IsTimestampValid, LL_TimestampNow} = require("../../timestamp.js");

// The unit to be tested.
const {LL_Database} = require("../../database.js");

module.exports = {
    test: test_Database,
};

async function test_Database()
{
    const listKey = "testeihin";
    const validUsername = "tester";
    const validPassword = "blaablaablaa";
    const invalidUsername = (validUsername + "s");
    const invalidPassword = (validPassword + "s");
    const numHoursTokenValid = 6;
    const database = LL_Database(listKey);
    const dbExecutor = require("../../database-executor-postgresql.js").instance();

    const validObservation1 = Object.freeze({
        species: "Jänkäkurppa",
        day: 24,
        month: 3,
        year: 2005,
    });

    const validObservation2 = Object.freeze({
        species: "Viiksitimali",
        day: 13,
        month: 11,
        year: 2021,
    });

    const invalidObservationSpecies = Object.freeze({
        ...validObservation1,
        species: "Eiootällastalintua",
    });

    async function login()
    {
        const loginDetails = await database.login(validUsername, validPassword);
        LLTest_ExpectTrue(()=>typeof loginDetails === "object");
        LLTest_ExpectTrue(()=>loginDetails.hasOwnProperty("token"));
        LLTest_ExpectTrue(()=>loginDetails.hasOwnProperty("until"));
        LLTest_ExpectTrue(()=>LL_IsTokenWellFormed(loginDetails.token) === true);
        return loginDetails;
    }
    
    // Login with invalid credentials.
    await LLTest_ExpectTrueAsync(async()=>(await database.login(validUsername, invalidPassword)) === false);
    await LLTest_ExpectTrueAsync(async()=>(await database.login(invalidUsername, validPassword)) === false);
    await LLTest_ExpectTrueAsync(async()=>(await database.login(invalidUsername, invalidPassword)) === false);
    await LLTest_ExpectThrowAsync(async()=>(await database.login(validPassword)) === false);
    await LLTest_ExpectThrowAsync(async()=>(await database.login(validUsername)) === false);
    await LLTest_ExpectThrowAsync(async()=>(await database.login()) === false);

    // Login/logout with correct credentials.
    {
        const loginDetails = await login();

        const tokenInDb = await dbExecutor.get_column_value("token", listKey);
        LLTest_ExpectTrue(()=>LL_IsTokenWellFormed(tokenInDb) === true);
        LLTest_ExpectTrue(()=>(tokenInDb === loginDetails.token));

        const tokenTimestampInDb = Number(await dbExecutor.get_column_value("token_valid_until", listKey));
        LLTest_ExpectTrue(()=>LL_IsTimestampValid(tokenTimestampInDb) === true);
        LLTest_ExpectTrue(()=>(tokenTimestampInDb === loginDetails.until));
        LLTest_ExpectTrue(()=>(tokenTimestampInDb > (LL_TimestampNow() + numHoursTokenValid * 60 * 60 - 60)));

        await database.logout(loginDetails.token);
    }

    // Add an observation.
    {
        const loginDetails = await login();

        // Reject empty add.
        await LLTest_ExpectThrowAsync(async()=>await database.add_observation());

        // Reject invalid parameters.
        await LLTest_ExpectThrowAsync(async()=>await database.add_observation(1));
        await LLTest_ExpectThrowAsync(async()=>await database.add_observation([]));
        await LLTest_ExpectThrowAsync(async()=>await database.add_observation({}));
        await LLTest_ExpectThrowAsync(async()=>await database.add_observation("Hello there"));
        await LLTest_ExpectThrowAsync(async()=>await database.add_observation(10.8));

        // Reject adding without a token.
        await LLTest_ExpectThrowAsync(async()=>await database.add_observation(validObservation1));

        // Reject adding an invalid observation.
        await LLTest_ExpectThrowAsync(async()=>await database.add_observation(invalidObservationSpecies));

        // Add with a valid token.
        await dbExecutor.set_column_value("observations", "", listKey);
        await database.add_observation(loginDetails.token, validObservation1);
        await database.add_observation(loginDetails.token, validObservation2);

        // Confirm the observations were added and can be queried correctly.
        const dbObservations = await database.get_observations();
        LLTest_ExpectTrue(()=>typeof dbObservations === "object");
        LLTest_ExpectTrue(()=>dbObservations.length === 2);
        LLTest_ExpectTrue(()=>dbObservations[0].species === validObservation1.species);
        LLTest_ExpectTrue(()=>dbObservations[0].day === validObservation1.day);
        LLTest_ExpectTrue(()=>dbObservations[0].month === validObservation1.month);
        LLTest_ExpectTrue(()=>dbObservations[0].year === validObservation1.year);
        LLTest_ExpectTrue(()=>dbObservations[1].species === validObservation2.species);
        LLTest_ExpectTrue(()=>dbObservations[1].day === validObservation2.day);
        LLTest_ExpectTrue(()=>dbObservations[1].month === validObservation2.month);
        LLTest_ExpectTrue(()=>dbObservations[1].year === validObservation2.year);
    
        await database.logout(loginDetails.token);
    }

    // Delete an observation.
    {
        const loginDetails = await login();

        await dbExecutor.set_column_value("observations", "", listKey);
        await database.add_observation(loginDetails.token, validObservation1);

        // Reject deleting an observation that doesn't exist in the list.
        await LLTest_ExpectThrowAsync(async()=>await database.delete_observation(loginDetails.token, validObservation2.species));
        
        // Valid delete.
        await database.delete_observation(loginDetails.token, validObservation1.species);

        // Confirm the observation was deleted.
        const dbObservations = await database.get_observations();
        LLTest_ExpectTrue(()=>typeof dbObservations === "object");
        LLTest_ExpectTrue(()=>dbObservations.length === 0);

        await database.logout(loginDetails.token);
    }

    return;
}

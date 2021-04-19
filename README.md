# lintulista-server

A server component for Lintulista, complementing the [Lintulista client](https://www.github.com/leikareipa/lintulista-client).

The server provides a REST API with which clients can interact with the Lintulista database.

You can find the client-to-server API reference [here](#client-to-server-api).

# Overview

Lintulista is a full-stack web app for hobbyist birdwatchers to keep track of their sightings ("observations").

The app's backend database stores lists of observations, each list being a collection of the observations maintained by a given Lintulista user.

The server allows the [Lintulista client](https://www.github.com/leikareipa/lintulista-client) to interact with the list database.

# Deploying

## Preparation

### Environment variables

The following environment variables must be available:

| Variable         | Description |
| ---------------- | ----------- |
| LL_HOST          | Should be set to "localhost" when deploying locally, and to something else otherwise. |
| LL_CLIENT_ORIGIN | Should identify the origin of Lintulista's client; e.g. "https://www.tarpeeksihyvaesoft.com" or "*". Used as the value in Access-Control-Allow-Origin response headers. |
| DATABASE_URL     | Should be a PostgreSQL connection string; e.g. "postgresql://...". |

For local deployment, you can define the above variables in a `.env` file in the repo's root.

### Database

Lintulista's database uses PostgreSQL and consists of a single table.

Each row in the table represents a list of observations belonging to a given Lintulista user.

```sql
CREATE TABLE lintulista (
    key VARCHAR(9) PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    observations TEXT NOT NULL,
    token CHAR(30) NOT NULL,
    token_valid_until BIGINT NOT NULL
);
```

| Column | Description |
| ------ | ----------- |
| key | List identifier; e.g. "aaaaaaaaa". |
| username | The list owner's username; e.g. "tester". |
| password_hash | A [bcrypt](https://www.npmjs.com/package/bcrypt) hash of the user's password. |
| token | Access token generated at user login. Client-originating requests to modify the list's data must be validated against this token. Empty string if there's currently no token (in which case all requests for token validation should be rejected). |
| token_valid_until | A Unix epoch timestamp (in seconds) for when the login token becomes invalid at the latest. A value of 0 indicates that there's no active token at present (in which case all requests for token validation should be rejected). |
| observations | A string encoding the user's observations. |

## Deploying locally

Execute the following in a terminal:

```shell
$ cd app && node run.js
```

The server will then be available at `localhost:8080`.

Issuing a plain GET request to the server should produce a response much like the following:

```json
{
    "data":{
        "message":"Requests must provide the 'list' URL parameter."},
    "valid":false
}
```

## Deploying on Heroku

1. Follow the instructions at [Deploying Node.js Apps on Heroku](https://devcenter.heroku.com/articles/deploying-nodejs)
2. Attach a Heroku PostgreSQL add-on and [initialize it for Lintulista](#database)

The repo comes with a Heroku-compatible `package.json` file.

The `DATABASE_URL` [environment variable](#environment-variables) will be set automatically by Heroku.

# Client-to-server API

The Lintulista client uses the server's REST API to interact with the Lintulista database.

The following client-to-server API actions are available:
- [Log in](#log-in)
- [Log out](#log-out)
- [Get a list's observations](#get-a-lists-observations)
- [Add an observation to a list](#add-an-observation-to-a-list)
- [Update an observation in a list](#update-an-observation-in-a-list)
- [Delete an observation from a list](#delete-an-observation-from-a-list)
- [Run server-side tests](#run-server-side-tests)

## Log in

Request format: POST [host]/login?list=[list_key]

Sample request:
```shell
$ curl localhost/login?list=aaaaaaaaa --request POST --header "Content-Type: application/json" --data '{"username":"...","password":"..."}'
```

Sample response (success):
```json
{
    "data":{
        "token":"...",
        "until":1615447887
    },
    "valid":true
}
```

Sample response (failure):
```json
{
    "data":{
        "message":"Invalid credentials."
    },
    "valid":false
}
```

A successful response returns a JSON object containing the `data.token` and `data.until` properties, in addition to the `valid` property whose value must equate to `true`.

The `data.token` property provides as a string a token which the client must attach to subsequent requests that require login (e.g. [deleting an observation](#delete-an-observation-from-a-list)). The `data.until` property is a number representing the maximum Unix epoch after which the login token is no longer valid.

Consecutive successful requests to log in will invalidate the existing login token, if any.

## Log out

Request format: DELETE [host]/login?list=[list_key]

- Requires [login](#log-in)

Sample request:
```shell
$ curl localhost/login?list=aaaaaaaaa --request DELETE --header "Content-Type: application/json" --data '{"token":"..."}'
```

Sample response (success):
```json
{
    "data":{},
    "valid":true
}
```

Sample response (failure):
```json
{
    "data":{
        "message":"The request could not be successfully processed."
    },
    "valid":false
}
```

## Get a list's observations

Request format: GET [host]/?list=[list_key]

- Requires [login](#log-in)

Sample request:
```shell
$ curl localhost/?list=aaaaaaaaa
```

Sample response (success):
```json
{
    "data":{
        "observations":[
            {"species":"Fasaani","day":12,"month":4,"year":2021},
            {"species":"Lehtokurppa","day":12,"month":4,"year":2021},
            {"species":"Tylli","day":12,"month":4,"year":2021}
        ]
    },
    "valid":true
}
```

Sample response (failure):
```json
{
    "data":{},
    "valid":false
}
```

Sample response (failure):
```json
{
    "data":{
        "message":"Requests must provide the 'list' URL parameter."
    },
    "valid":false
}
```

## Add an observation to a list

Request format: POST [host]/?list=[list_key]

- Requires [login](#log-in)

Sample request:
```shell
$ curl localhost/?list=aaaaaaaaa --request POST --header "Content-Type: application/json" --data '{"token":"...","species":"Tylli",day:1,month:2,year:2003}'
```

Sample response (success):
```json
{
    "data":{},
    "valid":true
}
```

Sample response (failure):
```json
{
    "data":{
        "message":"The request could not be successfully processed."
    },
    "valid":false
}
```

## Update an observation in a list

See [Add an observation to a list](#add-an-observation-to-a-list).

## Delete an observation from a list

Request format: DELETE [host]/?list=[list_key]

- Requires login

Sample request:
```shell
$ curl localhost/?list=aaaaaaaaa --request DELETE --header "Content-Type: application/json" --data '{"token":"...","species":"Tylli"}'
```

Sample response (success):
```json
{
    "data":{},
    "valid":true
}
```

Sample response (failure):
```json
{
    "data":{
        "message":"The request could not be successfully processed."
    },
    "valid":false
}
```

## Run server-side tests

Request format: GET [host]/test?list=[list_key]

- Available only if the environment variable LL_HOST is "localhost"
- Requires that Node.js has access to `process.stdout` (e.g. that the server is running in a terminal)
- The list key must be a valid list key string but doesn't need to be of an existant list (e.g. "aaaaaaaaa" will do)

Sample request:
```shell
$ curl localhost/test?list=aaaaaaaaa
```

Sample output (tests succeeded; server terminal):
```shell
Running unit tests (2021-04-19T16:42:18.251Z)
 PASS  UintStringer
 PASS  Observation
 PASS  Token
 PASS  ListKey
 PASS  Database
Done. All tests passed. 
```

Sample output (tests succeeded; server-to-client response):
```json
{
    "data":{
        "unit":"Done. All tests passed."
    },
    "valid":true
}
```

Sample output (some tests failed; server terminal):
```shell
Running unit tests (2021-04-19T16:42:18.251Z)
 PASS  UintStringer
 PASS  Observation
 PASS  Token
 FAIL  ListKey: Not true: ()=>LL_IsListKeyValid(1) === false
 PASS  Database
Done. 1/5 tests failed.
```

Sample output (some tests failed; server-to-client response):
```json
{
    "data":{
        "unit":"Done. 1/5 tests failed."
    },
    "valid":true
}
```

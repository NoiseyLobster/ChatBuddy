const express = require('express');
const axios = require('axios');
const jsonwebtoken = require('jsonwebtoken');

const server = express();
const port = 3000;

const API_TOKENS = {
    access: "",
    refresh: ""
};

//start the server on the specified port
server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

//make resources avaliable in the public directory for download to the browser 
server.use(express.static('public'));

//HTTP GET
//Routing for the base url
server.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/config.html");
});

//HTTP GET
//Routing for authorizing a new extension user for Twitch APIs
server.get('/authorize', (req, res) => {
    //TODO add state authorization for token/code https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#authorization-code-grant-flow
    if (!req.query.error && req.query.code) {
        let postData = {
            'client_id': getEnvConfigValue('TWITCH_POLL_EXTENSION_CLIENT_ID'),
            'client_secret': getEnvConfigValue('TWITCH_POLL_EXTENSION_CLIENT_API_SECRET'),
            'code': req.query.code,
            'grant_type': 'authorization_code',
            'redirect_uri': 'http://localhost:3000/register',
        };

        let options = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

        axios.post('https://id.twitch.tv/oauth2/token', postData, options)
            .then((response) => {
                API_TOKENS.access = response.data.access_token;
                API_TOKENS.refresh = response.data.refresh_token;

                res.status(200).json({ status: 'success' });
            })
            .catch((error) => {
                console.log(error)
            });
    }
    else {
        console.log(req.query.error);
    }
});

//HTTP GET
//Routing for authorization callback for a new extension user for Twitch APIs
server.get('/register', (req, res) => { });

function getEnvConfigValue(key) {
    let configValue = process.env[key] ?? "";

    if (process.env[key]) {
        configValue = process.env[key];
    }
    else {
        console.log(key + ' missing from configuration source');
        process.exit(1);
    }

    return configValue;
}
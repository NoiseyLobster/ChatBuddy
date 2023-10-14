const express = require('express');
const axios = require('axios');
const jsonwebtoken = require('jsonwebtoken');
const tmi = require('tmi.js');

const server = express();
const port = 3000;
const bearerPrefix = 'Bearer ';             // HTTP authorization headers have this prefix
const botUsername = 'noiseylobster13'

const API_TOKENS = {
    access: "",
    refresh: ""
};

//define twitch client for connecting to chat
let twitchClient = null;

//set a flag to determine if we have a poll running
let isPollActive = false;

//define array to store polling results
let pollingCategories = {};

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

//HTTP POST
//Routing to connect the twitch client to chat
server.post('/connectToChat', (req, res) => {
    //first validate the incoming request by inspecting the JWT
    const payload = validateJWT(req.headers.authorization);

    if (payload != null) {
        //create a Twitch client instance
        twitchClient = new tmi.client({
            identity: {
                username: botUsername,
                password: API_TOKENS.access
            },
            channels: [
                botUsername
            ]
        });

        //setup event handlers for initial connection and subsequent messages
        twitchClient.on('message', onMessageHandler);
        twitchClient.on('connected', onConnectedHandler);

        //connect to twitch
        twitchClient.connect();
    }
    else {
        console.log("Payload was null. Could not validate request.");
    }
});

//HTTP POST
//Routing to connect the twitch client to chat
server.post('/startPoll', (req, res) => {
    //first validate the incoming request by inspecting the JWT
    const payload = validateJWT(req.headers.authorization);

    if (payload != null) {
        isPollActive = true;
        pollingCategories = {};
    
        twitchClient.say(`#${botUsername}`, 'Started a polling window');
        console.log('Started a polling window');
    }
    else {
        console.log("Payload was null. Could not validate request.");
    }
});

//HTTP POST
//Routing to connect the twitch client to chat
server.post('/endPoll', (req, res) => {
    //first validate the incoming request by inspecting the JWT
    const payload = validateJWT(req.headers.authorization);

    if (payload != null) {
        isPollActive = false;

        twitchClient.say(`#${botUsername}`, formatPollingResults());
        console.log('Ending the polling window');
    }
    else {
        console.log("Payload was null. Could not validate request.");
    }
});

//utility function for handling the initial connection to twitch
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}

//utility function for handling incoming messages from twitch chat
function onMessageHandler(target, context, msg, self) {
    //if we sent the message, then disregard it
    if (self) { return; }

    //remove whitespace and log
    const userInput = msg.trim();

    //check if the message is a vote and if so count it 
    if (!isNaN(userInput)) {
        pollingCategories[userInput] = pollingCategories[userInput] ? pollingCategories[userInput] + 1 : 1;
    }
}

//utility function for printing formatted poll results
function formatPollingResults() {
    let formattedPollingResults = "Polling Results: ";

    for (let category in pollingCategories) {
        formattedPollingResults += "Category " + category + " has " + pollingCategories[category] + " vote(s). ";
    }

    return formattedPollingResults;
}

// Verify the header and the enclosed JWT.
function validateJWT(header) {
    if (header.startsWith(bearerPrefix)) {
        //bearer prefix detected so beginning validation

        try {
            const token = header.substring(bearerPrefix.length);
            const extension_secret = Buffer.from(getEnvConfigValue('TWITCH_POLL_EXTENSION_SECRET'), 'base64');

            return jsonwebtoken.verify(token, extension_secret, { algorithms: ['HS256'] });
        }
        catch (ex) {
            console.log("Could not authorize token. Invalid JWT.");
        }
    }
    else {
        console.log("Could not authorize request. Invalid or no authorization header passed.");
    }

    return null;
}

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
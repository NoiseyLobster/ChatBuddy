const express = require('express');
const jsonwebtoken = require('jsonwebtoken');

const server = express();
const port = 3000;

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
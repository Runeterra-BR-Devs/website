const express = require('express');
const app = express()
const fs = require('fs');
const http = require('http');
const https = require('https');

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/botruneterra.com.br/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/botruneterra.com.br/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/botruneterra.com.br/chain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

app.use(express.static('assets'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Starting both http & https servers
http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80);

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});
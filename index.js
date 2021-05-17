const express = require('express');
const app = express()
const fs = require('fs');
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser')

const { Server } = require("socket.io");

const isProduction = process.env.NODE_ENV != 'development';

// Certificate
const privateKey = isProduction ? fs.readFileSync('/etc/letsencrypt/live/botruneterra.com.br/privkey.pem', 'utf8') : '';
const certificate = isProduction ? fs.readFileSync('/etc/letsencrypt/live/botruneterra.com.br/cert.pem', 'utf8') : '';
const ca = isProduction ? fs.readFileSync('/etc/letsencrypt/live/botruneterra.com.br/chain.pem', 'utf8') : '';

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

var sockets = {};

app.use(express.static('assets'));
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/live-card/:stream', (req, res) => {
    res.sendFile(__dirname + '/live-card.html');
});

app.post('/send-card/:stream', (req, res) => {
    try{
        sockets[req.params.stream].emit('card', req.body);

        return res.json({
            status: '200'
        });
    } catch (e) {
        return res.json({
            message: 'Não deu certo'
        }).status(500);
    }
});

const httpServer = http.createServer(isProduction ? (req, res) => {
    if (isProduction) {
        res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
        return res.end();
    }
} : app).listen(80, () => {
    console.log('HTTP Server running on port 80');
});

const httpsServer = https.createServer(credentials, app);

if (isProduction) {
    httpsServer.listen(443, () => {
        console.log('HTTPS Server running on port 443');
    });
}

const io = new Server(isProduction ? httpsServer : httpServer);

io.on('connection', (socket) => {
    sockets[socket.handshake.query.username] = socket;
});
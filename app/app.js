'use strict';

const { EventEmitter } = require('events');
const express = require('express');
const http = require('http');
const linz = require('./linz');

const port = 8888;

class App extends EventEmitter {

    /**
     * App contructor.
     * @param {Object} options Linz options.
     * @return {Void} Starts the app.
     */
    constructor(options) {

        super();

        const app = express();
        app.get('/', (req, res) => res.status(200).send('Welcome to Linz!'));

        app.use(linz.middleware.error);

        this.app = app;

        linz.init({
            options: {
                'mongo': 'mongodb://mongo:27017/lmt',
                'user model': 'mtUser'
            }
        });

        linz.on('initialised', () => this.emit('ready'));

    }

    /**
     * Bootstrap the server.
     * @return {Void} Starts the server.
     */
    startServer() {

        console.log('Starting the HTTP server.');

        http.createServer(this.app)
            .listen(port, () => console.log(`Linz started and running on port ${port}`));

    }

}

module.exports = App;

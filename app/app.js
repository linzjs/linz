'use strict';

const { EventEmitter } = require('events');
const express = require('express');
const http = require('http');
const linz = require('./linz');
const middleware = require('./lib/loader')('./middleware');
const session = require('./lib/session');

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

        this.app = app;

        linz.init({
            'express': app,
            'session middleware': session,
            'options': {
                'mongo': 'mongodb://mongodb:27017/lmt',
                'user model': 'mtUser',
            }
        });

        linz.on('initialised', () => {

            linz.app.get('/', middleware.import, (req, res) => res.redirect(linz.get('login path')));

            linz.app.use(linz.middleware.error);

            this.emit('ready');

        });

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

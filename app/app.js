'use strict';

const { EventEmitter } = require('events');
const express = require('express');
const http = require('http');
const linz = require('./linz');
const middleware = require('./lib/loader')('./middleware');
const session = require('./lib/session');
const scripts = require('./lib/scripts');
const editCustomRoute = require('./routes/edit-custom');
const handlebars = require('express-handlebars');
const path = require('path');

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
            'options': {
                'mongo': 'mongodb://mongodb:27017/lmt',
                'session middleware': session,
                'user model': 'mtUser',
                'scripts': scripts,
            },
        });

        linz.on('initialised', () => {

            linz.app.set('views', path.join(__dirname, 'app/views/'));
            linz.app.engine('handlebars', handlebars.create({
                layoutsDir: path.join(__dirname, 'app/views/'),
                partialsDir: path.join(__dirname, 'app/views/partials/'),
            }).engine);
            linz.app.set('view engine', 'handlebars');

            linz.app.get('/', middleware.import, (req, res) => res.redirect(linz.get('login path')));

            // Custom form example.
            linz.app.get(`${linz.get('admin path')}/model/mtUser/:id/action/edit-custom`, editCustomRoute.get);
            linz.app.post(`${linz.get('admin path')}/model/mtUser/:id/action/edit-custom`, editCustomRoute.post);

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

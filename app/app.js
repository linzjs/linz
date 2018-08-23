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
            linz.app.get(`${linz.get('admin path')}/model/mtUser/:id/action/edit-custom`, (req, res, next) => {

                const User = linz.api.model.get('mtUser');
                const { id } = req.params;
                const docSchema = require('./schemas/docSchema');

                User.findById(id)
                    .then((record) => {

                        if (!record) {
                            return Promise.reject(new Error('User record not found'));
                        }

                        return linz.api.model.generateFormString(linz.api.model.get('mtUser'), {
                            actionUrl: `${linz.get('admin path')}/model/mtUser/:id/action/edit-custom`,
                            cancelUrl: `${linz.get('admin path')}/model/mtUser/list`,
                            form: {
                                name: {
                                    fieldset: 'Original',
                                },
                                email: {
                                    fieldset: 'Original',
                                },
                                alternativeEmails: {
                                    fieldset: 'Original'
                                },
                                username: {
                                    fieldset: 'Original',
                                },
                                birthday: {
                                    label: 'Birthday',
                                    fieldset: 'Details',
                                    type: 'date',
                                },
                                street: {
                                    label: 'Street',
                                    fieldset: 'Details',
                                },
                                city: {
                                    label: 'Docs',
                                    fieldset: 'Details',
                                    type: 'documentarray',
                                    schema: docSchema,
                                },
                            },
                            record,
                            req,
                            type: 'edit',
                        });

                    })
                    .then(body => linz.api.views.render({ body }, req, res))
                    .catch(next);

            });

            linz.app.post(`${linz.get('admin path')}/model/mtUser/:id/action/edit-custom`, (req, res) => res.json({ page: req.body }));

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

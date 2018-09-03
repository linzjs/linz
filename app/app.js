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
            'options': {
                'mongo': 'mongodb://mongodb:27017/lmt',
                'session middleware': session,
                'user model': 'mtUser',
                'scripts': (req, res) => {

                    let { scripts = [] } = res.locals;

                    if (req.originalUrl.match(/\/model\/mtUser\/.*\/action\/edit-custom$/)) {

                        scripts = scripts.concat([
                            {
                                src: '//cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.10/handlebars.min.js',
                                integrity: 'sha256-0JaDbGZRXlzkFbV8Xi8ZhH/zZ6QQM0Y3dCkYZ7JYq34=',
                                crossorigin: 'anonymous',
                            },
                            {
                                src: `${linz.get('admin path')}/public/js/jquery.binddata.js`,
                            },
                            {
                                src: `${linz.get('admin path')}/public/js/documentarray.js?v1`,
                            },
                            {
                                integrity: 'sha256-/wPGlKXtfdj9ryVH2IQ78d1Zx2/4PXT/leOL4Jt1qGU=',
                                src: '//cdnjs.cloudflare.com/ajax/libs/deep-diff/0.2.0/deep-diff.min.js',
                                crossorigin: 'anonymous',
                            },
                            {
                                integrity: 'sha256-ytdI1WZJO3kDPOAKDA5t95ehNAppkvcx0oPRRAsONGo=',
                                src: '//cdnjs.cloudflare.com/ajax/libs/json2/20140204/json2.min.js',
                                crossorigin: 'anonymous',
                            },
                            {
                                src: `${linz.get('admin path')}/public/js/model/edit.js`,
                            },
                        ]);

                    }

                    return Promise.resolve(scripts);

                },
            },
        });

        linz.on('initialised', () => {

            const docSchema = require('./schemas/docSchema');

            const customFormDsl = {
                name: {
                    fieldset: 'Original',
                },
                email: {
                    fieldset: 'Original',
                },
                alternativeEmails: {
                    fieldset: 'Original',
                    type: 'documentarray',
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
                docs: {
                    label: 'Docs',
                    fieldset: 'Details',
                    type: 'documentarray',
                    schema: docSchema,
                },
            };

            linz.app.get('/', middleware.import, (req, res) => res.redirect(linz.get('login path')));
            linz.app.get(`${linz.get('admin path')}/model/mtUser/:id/action/edit-custom`, (req, res, next) => {

                const User = linz.api.model.get('mtUser');
                const { id } = req.params;

                User.findById(id)
                    .then((record) => {

                        if (!record) {
                            return Promise.reject(new Error('User record not found'));
                        }

                        return linz.api.model.generateFormString(linz.api.model.get('mtUser'), {
                            actionUrl: `${linz.get('admin path')}/model/mtUser/${id}/action/edit-custom`,
                            cancelUrl: `${linz.get('admin path')}/model/mtUser/list`,
                            form: customFormDsl,
                            record,
                            req,
                            type: 'edit',
                        });

                    })
                    .then(body => linz.api.views.render({ body }, req, res))
                    .catch(next);

            });

            linz.app.post(`${linz.get('admin path')}/model/mtUser/:id/action/edit-custom`, (req, res, next) => {

                linz.api.formtools.parseForm(linz.api.model.get('mtUser'), req, customFormDsl)
                    .then(record => res.json({ page: record }))
                    .catch(next);

            });

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

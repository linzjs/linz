'use strict';

const path = require('path');
const fs = require('fs');
const error = require('./errors');
const debugModels = require('debug')('linz:models');
const linz = require('../');

const extendTypes = function() {
    // add custom types to mongoose
    require('./formtools/extend-types')();
};

const setModelOptions = (model) =>
    new Promise((resolve, reject) => {
        model.getModelOptions((err, options) => {
            if (err) {
                return reject(err);
            }

            model.linz.formtools.model = options;

            return resolve(model);
        });
    });

const setModelVersionSettings = (model) =>
    new Promise((resolve, reject) => {
        if (!model.getVersionsSettings) {
            return resolve(model);
        }

        model.getVersionsSettings((err, settings) => {
            if (err) {
                return reject(err);
            }

            model.versions = settings;

            return resolve(model);
        });
    });

const setModelConcurrencyControlOptions = (model) =>
    new Promise((resolve, reject) => {
        if (!model.getConcurrencyControlOptions) {
            return resolve(model);
        }

        model.getConcurrencyControlOptions((err, settings) => {
            if (err) {
                return reject(err);
            }

            model.concurrencyControl = settings;

            return resolve(model);
        });
    });

const initModels = () =>
    new Promise((resolve, reject) => {
        const models = linz.get('models');

        Promise.all(
            Object.keys(models).map((name) => {
                const model = models[name];

                // Add the formtools key in the linz namespace.
                model.linz = { formtools: {} };

                return Promise.all([
                    setModelOptions(model),
                    setModelVersionSettings(model),
                    setModelConcurrencyControlOptions(model),
                ]).then(() => debugModels('Loaded model %s', name));
            })
        )
            .then(() => resolve(models))
            .catch(reject);
    });

const loadModels = (dirPath) =>
    new Promise((resolve, reject) => {
        debugModels('Loading models from directory, %s', dirPath);

        const dir = path.resolve(process.cwd(), dirPath);

        let files = [];
        const models = {};

        try {
            files = fs.readdirSync(dir);
        } catch (e) {
            debugModels('Error: Unable to load models from directory, %s', dir);
            error.log(e.stack + '\n');

            return reject(e);
        }

        files.forEach((file) => {
            const name = path.basename(file, '.js');

            if (name === 'index') {
                return;
            }

            try {
                models[name] = require(dir + '/' + name);
            } catch (e) {
                debugModels('Error when loading model %s', name);
                error.log(e.stack + '\n');

                return reject(e);
            }
        });

        return resolve(models);
    });

module.exports = {
    extendTypes,
    initModels,
    loadModels,
    setModelConcurrencyControlOptions,
    setModelOptions,
    setModelVersionSettings,
};

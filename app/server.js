'use strict';

const App = require('./app');
const app = new App();

app.on('ready', app.startServer);

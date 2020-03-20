import express from 'express';
import helmet from 'helmet';
import { join } from 'path';
import { log } from 'winston';
import axios from "axios";
var cors = require('cors')
import https from 'https';
import fs from 'fs';
/**
 * Configures hot reloading and assets paths for local development environment.
 * Use the `npm start` command to start the local development server.
 *
 * @param app Express app
 */
const configureDevelopment = (app) => {
    const clientConfig = require('../webpack/client/dev');
    const serverConfig = require('../webpack/server/dev');
    const { publicPath, path } = clientConfig.output;

    const multiCompiler = require('webpack')([clientConfig, serverConfig]);
    const clientCompiler = multiCompiler.compilers[0];

    app.use(require('webpack-dev-middleware')(multiCompiler, { publicPath }));
    app.use(require('webpack-hot-middleware')(clientCompiler));

    app.use(publicPath, express.static(path));

    app.use(require('webpack-hot-server-middleware')(multiCompiler, {
        serverRendererOptions: { outputPath: path },
    }));
};

/**
 * Configures assets paths for production environment.
 * This environment is used in deployment and inside the docker container.
 * Use the `npm run build` command to create a production build.
 *
 * @param app Express app
 */
const configureProduction = (app) => {
    const clientStats = require('./assets/stats.json');
    const serverRender = require('./assets/app.server.js').default;
    const publicPath = '/';
    const outputPath = join(__dirname, 'assets');

    app.use(publicPath, express.static(outputPath));
    app.use(serverRender({
        clientStats,
        outputPath,
    }));
};

const app = express();
app.use(cors());
app.options('*', cors())
app.post('*', cors())

// Middleware for Serving Newly added Media files from D8.
app.get('/call_jira', function (req, res, next) {
  axios.get("https://athenajira.athenahealth.com/rest/api/2/issue/CSIR-1809",
         {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic dummydta',
        }
    }).then(response => {
        res.send(response.data);
    }).catch((error) => {
      console.log("error.config");
      console.log(error);
      //res.send("<div style='width:720px;margin:20px auto;'><img style='width: 163px; height: 24px;' src='https://www.athenahealth.com/resources/1e61f604e0cdd9e58e6a09ce93d165ae.png' alt='athenahealth'/><h1 style='font-size: 16px; font-family: sans-serif; font-weight: normal; margin: 20px 0px 0 0;'>www.athenahealth.com is currently down. Please try visiting the website again after some time.</h1></div>");
    });
});


const isDevelopment = process.env.NODE_ENV === 'development';

log('info', `Configuring server for environment: ${process.env.NODE_ENV}...`);
app.use(helmet());
app.set('port', process.env.PORT || 3000);

if (isDevelopment) {
    configureDevelopment(app);
} else {
    configureProduction(app);
}

app.listen(app.get('port'), () => log('info', `Dev Server listening on port ${app.get('port')}...`));


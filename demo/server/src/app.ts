'use strict';

import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as expressHbs from 'express-handlebars';
import * as logger from 'morgan';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import index from './routes/index';
import login from './securityRoutes/index';
import EnvironmentConfig, { CloudAppConfig, Config } from './util/config';

const app: express.Express = express();
const appConfig: Config<CloudAppConfig> = new EnvironmentConfig<CloudAppConfig>();
const config = appConfig.getConfig();

app.use(logger(config.morganOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')));

app.use('/', index, login);

app.use((req: express.Request, res: express.Response, next) => {
  const err: any = new Error('Not Found');
  err.status = 404;
  next(err);
});

function setupCustomLoginPageRender() {
  app.engine('hbs', expressHbs());
  app.set('view engine', 'hbs');
}
setupCustomLoginPageRender();

let errHandler: express.ErrorRequestHandler;

errHandler = (err: any, req: express.Request, res: express.Response, next: () => void) => {
  res.status(err.status || 500);
  res.render('error', {
    title: 'error',
    message: err.message,
    error: config.logStackTraces ? err : {}
  });
};

app.use(errHandler);
export default app;

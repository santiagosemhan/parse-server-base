import express from 'express';
import http from 'http';
import ParseServerOptions from './config';
import { booleanParser } from './cloud/utils';

const { ParseServer } = require('parse-server');
const ParseDashboard = require('parse-dashboard');

const { masterKey, readOnlyMasterKey, appId, liveQuery, serverURL, port } = ParseServerOptions;
const defaultDashboardUser = process.env.DASHBOARD_USER;
const defaultDashboardPass = process.env.DASHBOARD_PASS;
const testUser = process.env.DASHBOARD_TEST_USER;
const testPass = process.env.DASHBOARD_TEST_PASS;
const testReadOnly = booleanParser(process.env.DASHBOARD_TEST_READONLY);

const api = new ParseServer(ParseServerOptions);
const dashboard = new ParseDashboard(
  {
    apps: [
      {
        appName: 'Api',
        serverURL,
        // graphQLServerURL: "http://localhost:4040/parse/graphql",
        appId,
        masterKey,
        readOnlyMasterKey,
      },
    ],
    users: [
      {
        user: defaultDashboardUser,
        pass: defaultDashboardPass,
      },
      {
        user: testUser,
        pass: testPass,
        readOnly: testReadOnly,
      },
    ],
    useEncryptedPasswords: true,
  },
  {
    cookieSessionSecret: process.env.DASHBOARD_COOKIE_SESSION_SECRET || 'session_secret',
    trustProxy: 1,
    allowInsecureHTTP: !!process.env.DASHBOARD_ALLOW_INSECURE_HTTP || false,
  },
);

const app = express();
// @ts-ignore
const overrideParseServerHeaders = (req, res, next) => {
  const oldJson = res.json;
  // @ts-ignore
  res.json = (...args) => {
    res.removeHeader('x-powered-by');
    // do anything you wanna do with response before Parse Server calls .json
    oldJson.apply(res, args);
  };
  next();
};

// make the Parse Server available at /parse
app.use('/parse', overrideParseServerHeaders, api);
// make the Parse Dashboard available at /dashboard
app.use('/', dashboard);

const httpServer = http.createServer(app);
// eslint-disable-next-line no-console
httpServer.listen(port, () => console.log(`Server running on ${serverURL}`));
ParseServer.createLiveQueryServer(httpServer, {
  redisURL: liveQuery.redisURL,
  classNames: ['DeviceMessage', 'Sensor'],
});

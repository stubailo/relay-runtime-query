import express from 'express';
import graphQLHTTP from 'express-graphql';
import { Schema } from '../imports/api/schema';
import proxyMiddleware from 'http-proxy-middleware';

const app = express();

app.use('/graphql', graphQLHTTP({ schema: Schema, graphiql: true }));

app.listen(3005);

WebApp.rawConnectHandlers.use(proxyMiddleware('http://localhost:3005/graphql'));

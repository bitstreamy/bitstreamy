#!/usr/bin/env node

import { Logger } from "@bitstreamy/commons";
import Boom from "@hapi/boom";
import cors from "@koa/cors";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { errorHandler } from "./errorHandler";
import router from "./routers";

const PORT = process.env.PORT || "2001";

const VALID_CORS_ORIGINS = [
  "https://www.bitstreamy.com",
  "http://localhost:2002"
];

const app = new Koa();

app
  .use(errorHandler)
  .use(
    cors({
      origin: (ctx: Koa.Context) => {
        const originIndex = VALID_CORS_ORIGINS.indexOf(ctx.headers.origin);

        return VALID_CORS_ORIGINS[originIndex >= 0 ? originIndex : 0];
      }
    })
  )
  .use(
    bodyParser({
      onerror: err => {
        Logger.warn(err);
        throw Boom.badData();
      }
    })
  )
  .use(router.routes())
  .use(
    router.allowedMethods({
      methodNotAllowed: () => Boom.methodNotAllowed(),
      notImplemented: () => Boom.notImplemented(),
      throw: true
    })
  )
  .on("error", err => Logger.error(err))
  .listen(parseInt(PORT, 10));

Logger.info(`API is listening on port ${PORT}`);

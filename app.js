import express from "express";
import logger from "./logger.js";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Configuration
const PORT_NUM = 3000;
const HOST_NAME = "localhost";

const BASE_URL = process.env.API_TARGET_URL;

const options = {
  target: BASE_URL, // target host
  changeOrigin: true, // needed for virtual hosted sites
  pathRewrite: {
    ["^/proxy"]: "/api", // rewrite path
  },

  onProxyReq(proxyReq, req, res) {
    logger.info(
      `[BY_PROXY][request] ${proxyReq.method} /proxy${req.url} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`
    );
  },
  onProxyRes(proxyRes, req, res) {
    const { method, protocol, host, path } = proxyRes.req;
    logger.info(
      `[BY_PROXY][response] ${method} ${proxyRes.statusCode} /proxy${req.url} -> ${protocol}//${host}${path}`
    );
  },
  logProvider: () => logger,
};

const stealthProxy = createProxyMiddleware(options);

app.use(cors());
app.use("/proxy", stealthProxy);

app.get("/health", (request, response) => {
  response.send({ status: "All ok" });
});

app.listen(PORT_NUM, HOST_NAME, () => {
  console.log(`Starting Proxy at ${HOST_NAME}:${PORT_NUM}`);
});

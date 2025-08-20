//import { createServer } from "http";
//import next from "next";
//import { parse } from "url";

const { createServer } = require("http");
const next = require("next");
const { parse } = require("url");

const port = parseInt(process.env.PORT || "3765", 10);
const dev = process.env.NODE_ENV !== "production";
const hostname = dev ? "localhost" : "dev.oas.edmartsystems.com";
const nextApp = next({ dev: dev, hostname: hostname, port: port });
const nextReqHandler = nextApp.getRequestHandler();

nextApp
  .prepare()
  .then(async () => {
    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      nextReqHandler(req, res, parsedUrl);
    });

    server.listen(port, async () => {
      console.log(
        `> Server listening at http://localhost:${port} as ${
          dev ? "development" : process.env.NODE_ENV
        }`
      );
      if (!dev) {
        await startScheduler();
      }
    });
  })
  .catch(async (err) => {
    console.log("Failed to start server: " + (await err));
  });

const startScheduler = async () => {
  try {
    const res = await fetch(`https://${hostname}/api/services/scheduler`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const resData = await res.json();

    if (!res.ok || !resData) {
      console.log(
        "Failed to start the Scheduler: " + resData.message
          ? resData.message
          : "Unknown"
      );
      return;
    }

    console.log(
      "Scheduler Started Successfully: " + resData.message
        ? resData.message
        : "Unknown"
    );

    return;
  } catch (err) {
    console.log("Failed to start the Scheduler: " + err);
  }
};

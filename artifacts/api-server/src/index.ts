import app from "./app";
import { logger } from "./lib/logger";

// PORT is provided by the Replit deploy environment. For local development on
// any OS it defaults so the server starts with no env setup.
const rawPort = process.env["PORT"] || "5000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

import * as dotenv from "dotenv";
import cors from "cors";
import express from "express";

import { closePostgresPoolAndClient } from "./database.js";

import AllRoutesError from "../routes/AllRoutes.js";

dotenv.config();

const app = express();
let server = null;

async function onShutDownServer() {
    if (server) {
        closePostgresPoolAndClient((error) => {
            if (error) console.log(error);
            server.close(() => {
                process.exit(0);
            });
        });
    }
}

async function initializeServer() {
    if (!server) {
        app.use(cors());
        app.use(express.json());

        app.use(AllRoutesError);

        server = app.listen(process.env.PORT);
    }

    process.on("SIGTERM", async () => await onShutDownServer());
    process.on("SIGINT", async () => await onShutDownServer());
}

export default initializeServer;
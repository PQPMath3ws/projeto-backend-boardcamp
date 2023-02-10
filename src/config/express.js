import * as dotenv from "dotenv";
import cors from "cors";
import express from "express";

import { closePostgresPoolAndClient } from "./database.js";

import AllRoutes from "../routes/AllRoutes.js";
import CustomersRoutes from "../routes/Customers.js";
import RentalsRoutes from "../routes/Rentals.js";

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

        app.use(CustomersRoutes);
        app.use(RentalsRoutes);
        app.use(AllRoutes);

        server = app.listen(process.env.PORT);
    }

    process.on("SIGTERM", async () => await onShutDownServer());
    process.on("SIGINT", async () => await onShutDownServer());
}

export default initializeServer;
import * as dotenv from "dotenv";
import pg from "pg";

const { Pool } = pg;

dotenv.config();

let postgresPool = null;
let postgresClient = null;

const openPostgresPool = (database_url) => {
    if (!postgresPool) {
        postgresPool = new Pool({
            connectionString: database_url,
            ssl: process.env.MODE === "prod" ? true : false,
        });
    }
};

const openPostgresClient = async (callback) => {
    if (!postgresClient) {
        try {
            postgresClient = await postgresPool.connect();
            callback(null);
        } catch (error) {
            callback(error);
        }
    }
};

const getPostgresClient = () => {
    if (!postgresClient) throw Error("Cliente do pool do postgres não inicializado!");
    return postgresClient;
};

const closePostgresPoolAndClient = async (callback) => {
    if (postgresClient) {
        postgresClient.release();
        postgresClient = null;
    }
    if (postgresPool) {
        try {
            await postgresPool.end();
            postgresPool = null;
            callback(null);
        } catch (error) {
            callback(error);
        }
    }
};

export { closePostgresPoolAndClient, getPostgresClient, openPostgresClient, openPostgresPool };
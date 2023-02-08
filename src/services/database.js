import { closePostgresPoolAndClient, openPostgresClient, getPostgresClient, openPostgresPool } from "../config/database.js";

async function createDatabaseStructure(database_url_with_db, database_url_default) {
    await openPostgresClient(async (error) => {
        if (error) {
            if (error.code === "3D000") {
                await closePostgresPoolAndClient(async (error) => {
                    if (error) throw new Error(error);
                    openPostgresPool(database_url_default);
                    await openPostgresClient(async (error) => {
                        if (error) throw new Error(error);
                        try {
                            await getPostgresClient().query("CREATE DATABASE boardcamp;");
                            await closePostgresPoolAndClient(async (error) => {
                                if (error) throw new Error(error);
                                openPostgresPool(database_url_with_db);
                                await openPostgresClient(async (error) => {
                                    if (error) throw new Error(error);
                                    const dbSQL = "Q1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgImdhbWVzIiAoCiAgImlkIiBTRVJJQUwgUFJJTUFSWSBLRVksCiAgIm5hbWUiIFRFWFQgTk9UIE5VTEwsCiAgImltYWdlIiBURVhUIE5PVCBOVUxMLAogICJzdG9ja1RvdGFsIiBJTlRFR0VSIE5PVCBOVUxMLAogICJwcmljZVBlckRheSIgSU5URUdFUiBOT1QgTlVMTAopOwoKQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgImN1c3RvbWVycyIgKAogICJpZCIgU0VSSUFMIFBSSU1BUlkgS0VZLAogICJuYW1lIiBURVhUIE5PVCBOVUxMLAogICJwaG9uZSIgVEVYVCBOT1QgTlVMTCwKICAiY3BmIiBWQVJDSEFSKDExKSBOT1QgTlVMTCwKICAiYmlydGhkYXkiIERBVEUgTk9UIE5VTEwKKTsKCkNSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTICJyZW50YWxzIiAoCiAgImlkIiBTRVJJQUwgUFJJTUFSWSBLRVksCiAgImN1c3RvbWVySWQiIElOVEVHRVIgTk9UIE5VTEwsCiAgImdhbWVJZCIgSU5URUdFUiBOT1QgTlVMTCwKICAicmVudERhdGUiIERBVEUgTk9UIE5VTEwsCiAgImRheXNSZW50ZWQiIElOVEVHRVIgTk9UIE5VTEwsCiAgInJldHVybkRhdGUiIERBVEUsCiAgIm9yaWdpbmFsUHJpY2UiIElOVEVHRVIgTk9UIE5VTEwsCiAgImRlbGF5RmVlIiBJTlRFR0VSCik7";
                                    const b64Decoded = Buffer.from(dbSQL, "base64").toString("utf-8");
                                    try {
                                        await getPostgresClient().query(b64Decoded);
                                        getPostgresClient().release();
                                    } catch (error) {
                                        throw new Error(error);
                                    }
                                });
                            });
                        } catch (error) {
                            throw new Error(error);
                        }
                    });
                });
            } else {
                throw new Error(error);
            }
            console.log("Informações do banco postgres criadas com sucesso!");
        }
        console.log("Banco de dados já inicializado!");
    });
}

export default createDatabaseStructure;
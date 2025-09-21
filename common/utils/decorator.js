const { sqlPool } = require("../db.js");

function tryCatchSqlWrapper(fn) {
    return async function(...args) {
        const connection = await sqlPool.getConnection();
        try {

            return await fn(connection, ...args);

        } catch (error) {
            console.error(`Error in function ${fn.name}`);
            console.error("SQL Error:", error);
        } finally {
            connection.release();
        }
    }
}

module.exports = { tryCatchSqlWrapper };
const { pinecone, sqlPool } = require("../../common/db");
const { tryCatchSqlWrapper } = require("../../common/utils/decorator");
const index = pinecone.index("textdata", "https://textdata-12z6pih.svc.aped-4627-b74a.pinecone.io");

async function fetchPost() {
    // making connection  with the database
    const connection = await sqlPool.getConnection();
    try {
        // getting the post data from the database
        const [post] = await connection.execute("SELECT * FROM data_requests");
        return post;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        // closing connection with SQL
        connection.release();
    }
}

async function fetchUserPost(email) {
    // making connection with the database
    const connection = await sqlPool.getConnection();
    try {
        // getting userid based on email
        const [userId] = await connection.execute(
            "SELECT user_id FROM users WHERE email = ?",
            [email]
        );
        
        // getting the post data based on user id
        const [post] = await connection.execute(
            "SELECT * FROM data_requests WHERE user_id = ?",
            [userId[0].user_id]
        );
        return post;
    } catch(error) {
        console.error(error);
        throw error;
    } finally{
        // closing connection with SQL
        connection.release();
    }
}

async function fetchPostData(post_id, total) {
    // making connection with the database
    const connection = await sqlPool.getConnection();
    try {

        // getting the post data based on post id
        const [dataids] = await connection.execute(
            `SELECT data_id FROM post_data WHERE post_id = ? LIMIT ${parseInt(total)}`,
            [parseInt(post_id)]
        )

        const data = [];

        for (const item in dataids) {
            data.push(dataids[item].data_id.toString());
        }

        console.log("Data:", data);

        const checkerResponse = await index.fetch(data);

        const res = [];
        for (const item in checkerResponse.records) {
            const obj = {};
            obj["id"] = checkerResponse.records[item].id;
            obj["data"] = JSON.parse(checkerResponse.records[item].metadata.text);
            res.push(obj);
        }

        return res;
    } catch(error) {
        console.error(error);
        throw error;
    } finally {
        // closing connection with SQL
        connection.release();
    }
}

async function fetchPostNumberOfAvailableData(post_id) {
    // making connection with the database
    const connection = await sqlPool.getConnection();
    try {
        // getting the post data based on post id
        const [dataids] = await connection.execute(
            "SELECT data_id FROM post_data WHERE post_id = ?",
            [parseInt(post_id)]
        );
        return dataids.length;
    } catch(error) {
        console.error(error);
        throw error;
    } finally {
        // closing connection with SQL
        connection.release();
    }
}

const getBalance = tryCatchSqlWrapper(async (connection, email) => {
        const [rows, fields] = await connection.execute("SELECT balance FROM users WHERE email=?", [email]);
        return rows[0].balance;
});

const getOrderData = tryCatchSqlWrapper(async (connection, order_id) => {
    const [rows, fields] = await connection.execute("SELECT d.text_data FROM data d JOIN order_data o ON d.data_id = o.data_id WHERE o.order_id=?", [order_id]);
    return rows.map(row => row.text_data);
});

module.exports = {
    fetchPost,
    fetchUserPost,
    fetchPostData,
    fetchPostNumberOfAvailableData,
    getBalance,
    getOrderData
};
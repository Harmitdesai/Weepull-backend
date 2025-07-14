const { pinecone, sqlPool } = require("../../common/db");

const index = pinecone.index("textdata", "https://textdata-12z6pih.svc.aped-4627-b74a.pinecone.io");

async function fetchPost() {
    // making connection  with the database
    const connection = await sqlPool.getConnection();
    try {
        // getting the post data from the database
        const [post] = await connection.execute("SELECT * FROM dataRequests");
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
            "SELECT userid FROM users WHERE email = ?",
            [email]
        );
        
        // getting the post data based on user id
        const [post] = await connection.execute(
            "SELECT * FROM dataRequests WHERE userId = ?",
            [userId[0].userid]
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

async function fetchPostData(postId, total) {
    // making connection with the database
    const connection = await sqlPool.getConnection();
    try {

        // getting the post data based on post id
        const [dataids] = await connection.execute(
            `SELECT dataid FROM post_data WHERE postid = ? LIMIT ${parseInt(total)}`,
            [parseInt(postId)]
        )

        const data = [];

        for (const item in dataids) {
            data.push(dataids[item].dataid.toString());
        }

        console.log("Data:", data);

        const checkerResponse = await index.fetch(data);

        // console.log("Checker Response:", JSON.parse(checkerResponse.records[fid.toString()].metadata.text));
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

async function fetchPostNumberOfAvailableData(postId) {
    // making connection with the database
    const connection = await sqlPool.getConnection();
    try {
        // getting the post data based on post id
        const [dataids] = await connection.execute(
            "SELECT dataid FROM post_data WHERE postid = ?",
            [parseInt(postId)]
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

module.exports = {
    fetchPost,
    fetchUserPost,
    fetchPostData,
    fetchPostNumberOfAvailableData,
};
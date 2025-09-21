// //
const {pinecone, sqlPool} = require('../../common/db');
const { tryCatchSqlWrapper } = require("../../common/utils/decorator");
const OpenAI = require("openai");
require('dotenv').config({ path: '../../.env' });

const { getUserIdFromEmail } = require("../utils/sqlQueries");

// initialiing openai
const openai = new OpenAI({
    apiKey: "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"
  });

// getting index from pinecone
const index = pinecone.index("textdata", "https://textdata-12z6pih.svc.aped-4627-b74a.pinecone.io");

async function uploadTextDat(textData, email, postId) {
    var dataid;
    // making connection  with the database
    const connection = await sqlPool.getConnection();
    try {

        // getting the userid from the users table using the email
        const [user] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
        const userid = user[0].userid;

        // inserting new textdata entry in the textdata table and retrieving the dataid
        const [insertingResult] = await connection.execute("INSERT INTO data (userid) VALUES (?)", [userid]);
        if (insertingResult.affectedRows === 0) {
            throw new Error("Error saving textData");
        }
        dataid = insertingResult.insertId;
        console.log("Text data saved:", dataid);

        
        // getting embeddings for the text data
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: JSON.stringify(textData),
            encoding_format: "float",
        });
        
        const embeddings = embeddingResponse.data?.[0]?.embedding;
        
        
        // adding the text data to the pinecone index
        await index.upsert([{
            id : dataid.toString(),
            values : embeddings,
            metadata : {
                'text' : JSON.stringify(textData)
            },
        }]);
        
         const [postDataResult] = await connection.execute("INSERT INTO post_data (postid,dataid) VALUES (?,?)", [postId, parseInt(dataid)]);
        
         connection.release();
         
         return true;

        ///////////// There might be some error in the above code //////////////
        ///////////// Because when we fetches the data back from the pinecone if it will not be there for some reason it may will throw error and function won't return false //////////////
    } catch (error) {
        const removeTextData = connection.execute("DELETE FROM data WHERE dataid = ?", [dataid]);
        connection.release();
        if (removeTextData.affectedRows === 0) {
            throw new Error("Error removing textData");
        }
        console.log("Error saving textData:", error);
        throw error;
    }
}

const uploadTextData = tryCatchSqlWrapper((connection, textData, email, postId) => {
        userid = getUserIdFromEmail(email);

        // inserting new textdata entry in the textdata table and retrieving the dataid
        const [result] = connection.execute("INSERT INTO data (userid, textData) VALUES (?,?)", [userid, JSON.stringify(textData)]);

        const insertId = result.insertId;
        
        // getting embeddings for the text data
        // const embeddingResponse = openai.embeddings.create({
        //     model: "text-embedding-3-small",
        //     input: JSON.stringify(textData),
        //     encoding_format: "float",
        // });
        
        // const embeddings = embeddingResponse.data?.[0]?.embedding;
        
        
        // // adding the text data to the pinecone index
        // index.upsert([{
        //     id : dataid.toString(),
        //     values : embeddings,
        //     metadata : {
        //         'text' : JSON.stringify(textData)
        //     },
        // }]);
        
        connection.execute("INSERT INTO post_data (postid,dataid) VALUES (?,?)", [postId, parseInt(insertId)]);

        return true;
});

async function uploadPost(post, email) {

    // Initializing connection pool
    const connection = await sqlPool.getConnection();
    try {
        // getting the userid from the users table using the email
        const [user] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
        const userid = user[0].userid;
        // inserting new post entry in the posts table
        const [insertingResult] = await connection.execute("INSERT INTO dataRequests (title, example, description, userid, type) VALUES (?,?,?,?,?)", [post.title, post.example, post.description, userid, post.type]);
        if (insertingResult.affectedRows === 0) {
            throw new Error("Error saving post");
        }
        connection.release();
        return true;
    } catch (error) {
        console.log("Error saving post:", error);
        connection.release();
        return false;
    }
}

module.exports = {
    uploadTextData,
    uploadPost
};
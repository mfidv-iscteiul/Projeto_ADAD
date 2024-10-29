import { MongoClient } from "mongodb";

const connectionString = "mongodb+srv://user:PASSWORD@adadproject.jvzw4.mongodb.net/";
const client = new MongoClient(connectionString);

let conn;

try {
    conn = await client.connect();
} catch(e) {
    console.error(e);
}

// Database name
let db = conn.db("ADADProject");
export default db;
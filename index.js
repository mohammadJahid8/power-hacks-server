// db_user
// dF$f@8ph7Jbiu7v
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
const corsConfig = {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(cors(corsConfig));
app.options("*", cors(corsConfig));
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept,authorization"
    );
    next();
});
app.use(express.json());

const uri = "mongodb+srv://power_admin:wNOBGZzJPH5F9oX9@cluster0.c7vvh.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();

        const billsCollection = client.db("powerHacks").collection("bills");


        //getting data from database
        app.get("/billing-list", async (req, res) => {
            const limit = Number(req.query.limit);
            const pageNumber = Number(req.query.pageNumber);
            const cursor = billsCollection.find();
            const bills = await cursor.skip(limit    * pageNumber).limit(limit).toArray();
            res.send(bills);
        });

        // app.post("/add-billing", async (req, res) => {


        // })

    } finally {
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`project listening on port ${port}`);
});

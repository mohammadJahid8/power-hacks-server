// db_user
// dF$f@8ph7Jbiu7v
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const { createToken } = require("./JWT");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
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
        const usersCollection = client.db("powerHacks").collection("users");


        //getting data from database
        app.get("/billing-list", async (req, res) => {
            const limit = Number(req.query.limit);
            const pageNumber = Number(req.query.pageNumber);
            const cursor = billsCollection.find();
            // console.log(cu);
            const bill = await cursor.skip(limit * pageNumber).limit(limit).toArray();
            const bills = bill.reverse();
            const totalBills = await billsCollection.estimatedDocumentCount();
            res.send({ bills, totalBills });
        });

        //posted a bill
        app.post("/add-billing", async (req, res) => {
            const bill = req.body;
            const result = await billsCollection.insertOne(bill);
            res.send(result);
        });

        //update a bill
        app.put("/update-billing/:id", async (req, res) => {
            const id = req.params.id;
            const newBill = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: newBill
            };
            const result = await billsCollection.updateOne(
                query,
                updatedDoc,
                options
            );
            res.send(result);
        });

        //Delete a bill
        app.delete("/delete-billing/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await billsCollection.deleteOne(query);
            res.send(result);
        });

        //register
        app.post("/registration", async (req, res) => {
            const { email, username, password } = req.body;
            try {
                let isUser = await usersCollection.findOne({ email });
                if (isUser) {
                    return res.status(400).json({ error: "User Already exists" });
                }
                const hashedPass = await bcrypt.hash(password, 10);
                const user = {
                    username,
                    email,
                    password: hashedPass,
                };
                const result = await usersCollection.insertOne(user);
                // res.send(result);
                // await user.save();
                res.status(201).json({ message: "User Created Successfully" });
            } catch (error) {
                if (error) {
                    return res.status(400).json({ error: error.message });
                }
            }


        })
        app.post("/login", async (req, res) => {
            const { email, password } = req.body;
            try {
                let isUser = await usersCollection.findOne({ email });
                if (!isUser) {
                    return res.status(400).json({ error: "User does not exists" });
                }
                const isMatch = await bcrypt.compare(password, isUser.password);
                if (!isMatch) {
                    return res.status(400).json({ error: "Password is incorrect" });
                }
                const accessToken = createToken(isUser);
                res.cookie("access_token", accessToken, {
                    maxAge: 60 * 60 * 24 * 30 * 1000,
                });
                res.json('Login Successful');
                // res.json('Login Successful');

                // const token = jwt.sign({ id: isUser._id }, process.env.JWT_KEY);
                // res.status(200).json({ token });
            } catch (error) {
                if (error) {
                    return res.status(400).json({ error: error.message });
                }
            }
        })

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

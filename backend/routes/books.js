import express from "express";
import db from "../db/config.js";
const router = express.Router();

//Endpoint 9
router.post("/:id", (req, res) => {
    let results = db.collection("books").updateOne(
        {_id: parseInt(req.params.id)},
        {$set: req.body}
    )

    res.send(results).status(200);
})

//Endpoint 11
router.get("/top/:limit", async (req, res) => {
    let results = await db.collection("users").aggregate([
        {$unwind :
            "$reviews"
        },
        {$group : {
            _id: "$reviews.book_id",
            average_score: {$avg: "$reviews.score"}
        }},
        {$sort: { 
            average_score: -1 
        }}
    ]).limit(parseInt(req.params.limit)).toArray();

    res.send(results).status(200);
})

//Endpoint 12
router.get("/ratings/:order", (req, res) => {

})

export default router;
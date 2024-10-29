import express from "express";
import db from "../db/config.js";
const router = express.Router();

router.post("/:id", (req, res) => {
    let results = db.collection("books").updateOne(
        {_id: req.params.id},
        {$set: req.body}
    )

    res.send(results).status(200);
})

router.post("/top/:limit", (req, res) => {

})

router.post("/ratings/:order", (req, res) => {

})

export default router;
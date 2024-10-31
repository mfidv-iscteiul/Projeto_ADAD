import express from "express";
import db from "../db/config.js";
const router = express.Router();

//Endpoint 10
router.post("/:id", (req, res) => {
    let results = db.collection("users").updateOne(
        {_id: req.params.id},
        {$set: req.body}
    )

    res.send(results).status(200);
})

export default router;
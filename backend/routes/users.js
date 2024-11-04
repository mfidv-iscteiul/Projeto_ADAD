import express from "express";
import db from "../db/config.js";
const router = express.Router();


//Endpoint 2

router.get("/", async(req, res) => {
    const page = req.query.page || 0 ; // vai buscar a pagina que podera estar numa query do tipo ?page=1
    const usersPerPage=5;


    let results = await db.collection("users").find({})
    .skip(page* usersPerPage)
    .limit(usersPerPage)
    .toArray();

    res.send(results).status(200);
} )

//Endpoint 4
router.get("/", async(req, res) => {
   const user = req.body;
   
   let results = await db.collection("users")

} )



//Endpoint 10
router.post("/:id", (req, res) => {
    let results = db.collection("users").updateOne(
        {_id: req.params.id},
        {$set: req.body}
    )

    res.send(results).status(200);
})

export default router;
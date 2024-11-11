import express from "express";
import db from "../db/config.js";
const router = express.Router();

//Endpoint 9
router.put("/:id", async (req, res) => {
    let results = await db.collection("books").updateOne(
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
        }},
        {$lookup: {
            from: "books",
            localField: "_id",
            foreignField: "_id",
            as: "livro"
        }},
        { $project: {
            _id:0
        }}
    ]).limit(parseInt(req.params.limit)).toArray();

    res.send(results).status(200);
})

//Endpoint 12
router.get("/ratings/:order", async (req, res) => {
    const order = req.params.order == "asc" ? 1 : -1;

    let results = await db.collection("users").aggregate([
        {$unwind :
            "$reviews"
        },
        {$group : {
            _id: "$reviews.book_id",
            number_of_reviews: {$count: {}}
        }},
        {$sort: {
            number_of_reviews: order
        }},
        {$lookup: {
            from: "books",
            localField: "_id",
            foreignField: "_id",
            as: "livro"
        }},
        { $project: {
            _id:0
        }}
    ]).toArray();

    res.send(results).status(200);
})

//Endpoint 13
router.get('/star', async (req, res) => {
	let results = await db.collection("users").aggregate([
		//permite aceder ao array reviews
		{ $unwind: "$reviews" },
		//vai buscar os livros com pelo menos uma review de 5 estrelas
		{
			$match: {
				"reviews.score": 5
			}
		},
		//conta os reviews de 5 estrelas de cada livro
		{
			$group: {
				_id: "$reviews.book_id",
				number_of_reviews: { $count: {} }
			}
		},
		//apresenta toda a informação do livro
		{
			$lookup: {
				from: "books",
				localField: "_id",
				foreignField: "_id",
				as: "livro"
			}
		},
		{ $project: { _id: 0 } }
	]).toArray();
	res.send(results).status(200);
})

//Endpoint 15
router.get('/comments', async (req, res) => {
	let results = await db.collection("comments").aggregate([
		{
			$group: {
				_id: "$book_id",
				number_of_comments: { $count: {} }
			}
		},
		{
			$sort: {
				number_of_comments: -1
			}
		},
		{
			$lookup: {
				from: "books",
				localField: "_id",
				foreignField: "_id",
				as: "livro"
			}
		},
		{
			$project: {
				_id: 0
			}
		}
	]).toArray();
	res.send(results).status(200);
})

//Endpoint 16
router.get('/job', async (req, res) => {
	let results = await db.collection("users").aggregate([
		{
			$unwind: "$reviews"
		},
		{
			$group: {
				_id: "$job",
				number_of_reviews: { $count: {} }
			}
		},
		{
			$sort: {
				number_of_reviews: -1
			}
		}
	]).toArray();
	res.send(results).status(200);
})

export default router;

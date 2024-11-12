import express from "express";
import db from "../db/config.js";
const router = express.Router();

//Função auxiliar para verificar se o id é um Integer ou um ObjectID
export function verifyID(id) {
	let aux;
	if (!isNaN(id)) {
	  aux = parseInt(id);
	} else if (ObjectId.isValid(id)) {
	  aux = new ObjectId(id);
	} else {
	  return res.send({ message: "ID inválido" }).status(400);
	}
	return aux;
  }

  // 1. GET /books - Lista de livros com paginação
router.get('/', async (req, res) => {
	const page = parseInt(req.query.page) || 1; 
	const limit = parseInt(req.query.limit) || 10;
	const skip = (page - 1) * limit;
  
	try {
	  const books = (await db.collection('books').find().sort({ _id: 1 }).skip(skip).limit(limit).toArray());
	  res.send({ page, limit, books }).status(200);
	} catch (error) {
	  res.send({ message: "Erro ao buscar livros" }).status(500);
	}
  });

// 3. POST /books - Adicionar 1 ou vários livros
router.post('/', async (req, res) => {
	const books = Array.isArray(req.body) ? req.body : [req.body];
	try {
	  const result = await db.collection("books").insertMany(books);
	  if (result.insertedCount === 0) return res.send({ message: "Nenhum livro adicionado" }).status(404);
	  res.send({ message: "Livros adicionados com sucesso", insertedCount: result.insertedCount }).status(201);
	} catch (error) {
	  res.send({ message: "Erro ao adicionar livro"}).status(500);
	}
  });

  // 5. GET /books/:id - Buscar livro por _id com média de score e comentários
router.get('/:id', async (req, res) => {
	try {
	  let bookId = verifyID(req.params.id);
  
	  // Buscar o livro com base no ID
	  const book = await db.collection("books").aggregate([
		{ $match: { _id: bookId } },  
		{ $lookup: {
			from: "comments",  
			localField: "_id",  
			foreignField: "book_id",  
			as: "comments"  
		  }
		},
	  ]).toArray();
  
	  if (book.length === 0) return res.send({ message: "Livro não encontrado" }).status(404);
  
	  // Calcular a média de scores dos reviews dos users
	  const scoreData = await db.collection("users").aggregate([
		{ $unwind: "$reviews" }, 
		{ $match: { "reviews.book_id": bookId } }, 
		{ $group: { _id: null, averageScore: { $avg: "$reviews.score" } } } 
	  ]).toArray();
  
	  // Adicionar a média de score ao livro
	  book[0].averageScore = scoreData.length > 0 ? scoreData[0].averageScore : 0;
  
	  return res.send(book[0]).status(200);
  
	} catch (error) {
	  res.send({ message: "Erro ao buscar livro", error: error.message }).status(500);
	}
  });

  // 7. DELETE /books/:id - Remover livro pelo _id
router.delete('/:id', async (req, res) => {
	try {
	  let bookId = verifyID(req.params.id);
  
	  const result = await db.collection("books").deleteOne({ _id: bookId });
	  if (result.deletedCount === 0) {
		return res.send({ message: "Livro não encontrado" }).status(404);
	  }
  
	  return res.send({ message: "Livro removido com sucesso" }).status(200);
	} catch (error) {
	  res.send({ message: "Erro ao remover livro", error: error.message }).status(500);
	}
  });


//Endpoint 9
router.put("/:id", async (req, res) => {
	try {
		const bookID = verifyID(req.params.id);

		let results = await db.collection("books").updateOne(
			{ _id: parseInt(bookID) },
			{ $set: req.body }
		)

		if(results.modifiedCount ===  1){
			return res.send({message: "Livro atualizado com sucesso"}).status(200);
		}else if (results.modifiedCount ===  0 && results.matchedCount ===  1) {
			return res.send({message: "Informação para atualizar igual à enviada"}).status(200);
		}
		res.send({message: "Livro não encontrado"}).status(404);

	} catch (error) {
		res.send({ message: "Erro ao atualizar livro." }).status(500);
	}
})

//Endpoint 11
router.get("/top/:limit", async (req, res) => {
	try {
		let results = await db.collection("users").aggregate([
			{
				$unwind:
					"$reviews"
			},
			{
				$group: {
					_id: "$reviews.book_id",
					average_score: { $avg: "$reviews.score" }
				}
			},
			{
				$sort: {
					average_score: -1
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
					_id: 0,
					"livro._id": 0
				}
			}
		]).limit(parseInt(req.params.limit)).toArray();
	
		res.send(results).status(200);

	} catch (error) {
		res.send({ message: "Erro ao buscar utilizadores e livros." }).status(500);
	}
})

//Endpoint 12
router.get("/ratings/:order", async (req, res) => {
	try {
		const order = req.params.order == "asc" ? 1 : -1;

		let results = await db.collection("users").aggregate([
			{
				$unwind:
					"$reviews"
			},
			{
				$group: {
					_id: "$reviews.book_id",
					number_of_reviews: { $count: {} }
				}
			},
			{
				$sort: {
					number_of_reviews: order
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
					_id: 0,
					"livro._id": 0
				}
			}
		]).toArray();

		res.send(results).status(200);

	} catch (error) {
		res.send({ message: "Erro ao buscar utilizadores e livros." }).status(500);
	}
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

import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";
const router = express.Router();

/* --------  Funções auxiliares  -------- */

const documentsPerPage = 20;

export function Pagination(results, page) {

	let maxPages = Math.ceil(results.length / documentsPerPage);

	if (!parseInt(page) || page <= 0) {
		page = 1;
	}

	let limitedResults = results.slice(page * documentsPerPage - documentsPerPage, page * documentsPerPage);

	return { limitedResults, maxPages, page };
}

//Função auxiliar para verificar se o id é um Integer ou um ObjectID
export function VerifyID(id) {
	let aux;
	if (!isNaN(id)) {
		aux = parseInt(id);
	} else if (ObjectId.isValid(id)) {
		aux = new ObjectId(id);

	}
	return aux;
}

/* --------  FIM Funções auxiliares  -------- */

// 1. GET /books - Lista de livros com paginação
router.get('/', async (req, res) => {

	try {

		let books = (await db.collection('books').find()
			.sort({ _id: 1 })
			.toArray());

		let data = Pagination(books, parseInt(req.query.page));

		if (req.query.page > data.maxPages) { return res.send({ message: "Esta página não existe" }).status(404) };

		res.send(data).status(200);

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

		res.send({ message: "Livros adicionados com sucesso" }).status(201);

	} catch (error) {

		res.send({ message: "Erro ao adicionar livro" }).status(500);
	}
});

// 5. GET /books/:id - Buscar livro por _id com média de score e comentários
router.get('/id/:id', async (req, res) => {
    try {
        let bookId = VerifyID(req.params.id);

        // Buscar o livro com os comentários
        const book = await db.collection("books").aggregate([
            { $match: { _id: bookId } },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "book_id",
                    as: "comments"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "comments.user_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            }
        ]).toArray();

        // Se o livro não for encontrado
        if (book.length === 0) {
            return res.status(404).send({ message: "Livro não encontrado" });
        }

        // Adicionar nome completo diretamente nos comentários
        const bookWithNames = book[0];
        bookWithNames.comments = bookWithNames.comments.map(comment => {
            const user = bookWithNames.userDetails.find(user => user._id.toString() === comment.user_id.toString());
            comment.name = user ? `${user.first_name} ${user.last_name}` : "Anônimo";
            return comment;
        });

        // Remover detalhes do usuário para não retornar dados desnecessários
        delete bookWithNames.userDetails;

        // Calcular a média de scores dos reviews dos users
        const scoreData = await db.collection("users").aggregate([
            { $unwind: "$reviews" },
            { $match: { "reviews.book_id": bookId } },
            { $group: { _id: null, averageScore: { $avg: "$reviews.score" } } }
        ]).toArray();

        // Adicionar a média de score ao livro
        bookWithNames.averageScore = scoreData.length > 0 ? scoreData[0].averageScore : 0;

        // Retornar o livro com os dados atualizados
        return res.status(200).send(bookWithNames);

    } catch (error) {
        return res.status(500).send({ message: "Erro ao buscar livro", error: error.message });
    }
});


// 7. DELETE /books/:id - Remover livro pelo _id
router.delete('/:id', async (req, res) => {

	try {

		let bookId = VerifyID(req.params.id);

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
		const bookID = VerifyID(req.params.id);

		let results = await db.collection("books").updateOne(
			{ _id: bookID },
			{ $set: req.body }
		)

		if (results.modifiedCount === 1) {
			return res.send({ message: "Livro atualizado com sucesso" }).status(200);
		} else if (results.modifiedCount === 0 && results.matchedCount === 1) {
			return res.send({ message: "Informação para atualizar igual à enviada" }).status(200);
		}
		res.send({ message: "Livro não encontrado" }).status(404);

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

		let data = Pagination(results, parseInt(req.query.page));

		if (req.query.page > data.maxPages) { return res.send({ message: "Esta página não existe" }).status(404) };

		res.send(data).status(200);

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

		let data = Pagination(results, parseInt(req.query.page));

		if (req.query.page > data.maxPages) { return res.send({ message: "Esta página não existe" }).status(404) };

		res.send(data).status(200);

	} catch (error) {

		res.send({ message: "Erro ao buscar utilizadores e livros." }).status(500);

	}
})

//Endpoint 13
router.get('/star', async (req, res) => {
	try {

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
					number_of_5_star_reviews: { $count: {} }
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
			{
				$sort: {
					number_of_5_star_reviews: -1
				}
			},
			{ $project: { _id: 0 } }
		]).toArray();

		let data = Pagination(results, parseInt(req.query.page));

		if (req.query.page > data.maxPages) { return res.send({ message: "Esta página não existe" }).status(404) };

		res.send(data).status(200);

	} catch (error) {

		res.send({ message: "Erro ao apresentar as informções do Livro com 5 estrelas" }).status(500);

	}
})

//Endpoint 14
router.get('/year/:year', async (req, res) => {
	try {

		//cria as os timestamps do ano pedido e do ano seguinte
		const aux = parseInt(req.params.year) + 1
		const timestampInferior = new Date(req.params.year).getTime().toString();
		const timestampSuperior = new Date(aux.toString()).getTime().toString();

		let results = await db.collection("users").aggregate([
			{ $unwind: "$reviews" },
			//verifica se o timestamp de uma review pertence ao ano pedido
			{
				$match: {
					$and: [
						{ "reviews.review_date": { $gte: timestampInferior } },
						{ "reviews.review_date": { $lt: timestampSuperior } }
					]
				}
			},
			//agrupa as reviews por livro
			{
				$group: {
					_id: "$reviews.book_id"
				}
			},
			{
				$sort: {
					_id: 1
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
					"livro.title": 1, "livro._id": 1, _id: 0
				}
			}
		]).toArray();

		let data = Pagination(results, parseInt(req.query.page));

		if (req.query.page > data.maxPages) { return res.send({ message: "Esta página não existe" }).status(404) };

		res.send(data).status(200);

	} catch (error) {

		res.send({ message: "Erro ao apresentar as avaliações." }).status(500);

	}
})

//Endpoint 15
router.get('/comments', async (req, res) => {
	try {

		let results = await db.collection("comments").aggregate([
			//agrupa os livros por id e conta os comentários que cada um tem
			{
				$group: {
					_id: "$book_id",
					number_of_comments: { $count: {} }
				}
			},
			//ordena os livros por ordem decrescente de comentários
			{
				$sort: {
					number_of_comments: -1
				}
			},
			//apresenta a informação em relação aos livros
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

		let data = Pagination(results, parseInt(req.query.page));

		if (req.query.page > data.maxPages) { return res.send({ message: "Esta página não existe" }).status(404) };

		res.send(data).status(200);

	} catch (error) {

		res.send({ message: "Erro ao apresentar os comentários." }).status(500);

	}
})

//Endpoint 16
router.get('/job', async (req, res) => {
	try {

		let results = await db.collection("users").aggregate([
			{
				$unwind: "$reviews"
			},
			//agrupa pelo job e conta as reviews de cada job
			{
				$group: {
					_id: "$job",
					number_of_reviews: { $count: {} }
				}
			},
			//ordena o número de reviews por ordem decrescente
			{
				$sort: {
					number_of_reviews: -1
				}
			}
		]).toArray();
		
		let data = Pagination(results, parseInt(req.query.page));

		if (req.query.page > data.maxPages) { return res.send({ message: "Esta página não existe" }).status(404) };

		res.send(data).status(200);

	} catch (error) {

		res.send({ message: "Erro ao apresentar o número de avaliações." }).status(500);

	}
})

//Endpoint 17 colocar na documentação que é obrigatório colocar autor, ou então, posso desenvolver, caso não seja passado um autor
router.get('/:price/:category/:author', async (req, res) => {
	try {

		let results = await db.collection("books").aggregate([

			{ //filtra o preço
				$match: {
					price: parseInt(req.params.price)
				}
			},
			//unwind à query categories
			{ $unwind: "$categories" },
			{ //filtra a categoria
				$match: {
					categories: req.params.category
				}
			},

			//unwind à query authors
			{ $unwind: "$authors" },

			{ //filtra o autor
				$match: {
					authors: req.params.author
				}
			},

		]).toArray();

		res.send(results).status(200);

	} catch (error) {

		res.send({ message: "Erro na filtração" }).status(500);

	}
})

export default router;

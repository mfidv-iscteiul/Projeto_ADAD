import express from "express";
import db from "../db/config.js";
const router = express.Router();

import { Pagination } from './books.js'; // para ir buscar a funcao de paginação nos books
import { VerifyID } from './books.js'; // para ir buscar a funcao desenvolvida nos books


function getCoords(point) {
	const intCoords = [];
	const coords = point.split(",");
	coords.forEach((coord) => {
		intCoords.push(parseFloat(coord));
	});
	return intCoords;
}

// 1. Adicionar livro à livraria
router.post('/:id/:bookId', async (req, res) => {
	try {

		// Verifica se a livraria existe
		const livraria = await db.collection("livrarias").findOne({ _id: parseInt(req.params.id) });
		if (!livraria) {
			return res.send({ message: "Livraria não encontrada" }).status(404);
		}

		// Verifica se o livro já está na livraria
		const bookChecker = await db.collection("livrarias").aggregate([
			{ $match: { _id: parseInt(req.params.id) } },
			{ $unwind: "$books" },
			{ $match: { "books._id": VerifyID(req.params.bookId) } }
		]).toArray();

		if (bookChecker.length > 0) {
			return res.send({ message: "Livro já está na livraria" }).status(400);
		}

		// Adiciona o livro à livraria se não estiver presente
		const result = await db.collection("livrarias").updateOne(
			{ _id: parseInt(req.params.id) },
			{ $push: { books: await db.collection("books").findOne({ _id: VerifyID(req.params.bookId) }) } }  // Adiciona o livro à lista
		);

		res.send({ message: "Livro adicionado à livraria com sucesso" }).status(201);

	} catch (error) {

		res.send({ message: "Erro ao adicionar livro" }).status(500);
	}
});




// 2. Consultar livros numa livraria específica com paginação
router.get('/:id', async (req, res) => {
	try {

		const livraria = await db.collection("livrarias").aggregate([

			{ $match: { _id: parseInt(req.params.id) } },

			{ $unwind: "$books" },

			{
				$group: {

					_id: "$_id",
					books: { $push: "$books" }
				}

			}
		]).toArray();

		let data = Pagination(livraria[0].books, parseInt(req.query.page));

		// Verifica se a livraria foi encontrada
		if (livraria.length === 0) {
			return res.status(404).send({ message: "Livraria vazia / Livraria não encontrada" });
		}

		res.send(data).status(200);

	} catch (error) {
		res.send({ message: "Erro ao consultar livros", error: error.message }).status(500);
	}
});


// 3. Lista de livrarias perto de uma localização
router.get('/near/:p1', async (req, res) => {
	try {

		const results = await db.collection("livrarias").find({
			geometry: {
				$near: {
					$geometry: {
						type: "Point",
						coordinates: [getCoords(req.params.p1)[0], getCoords(req.params.p1)[1]],

					},
					$maxDistance: 2000
				}
			}



		}).project({
			_id: 1,
			"properties.INF_NOME": 1,  // Nome da livraria
			"properties.INF_MORADA": 1, // Endereço da livraria
			"geometry.coordinates": 1  // Coordenadas da livraria
		}).toArray();
		res.send(results).status(200);
	} catch (error) {
		res.send({ message: "Erro a consultar as livrarias mais perto", error: error.message }).status(500);
	}
});



//4. Lista de livrarias perto do caminho de uma rota (São passadas as quatro coordenadas neste formato: "longitude,latitude")
router.get('/:p1/:p2/:p3/:p4', async (req, res) => {
	try {



		let p1Long = getCoords(req.params.p1)[0];
		let p1Lat = getCoords(req.params.p1)[1];
		let p2Long = getCoords(req.params.p2)[0];
		let p2Lat = getCoords(req.params.p2)[1];
		let p3Long = getCoords(req.params.p3)[0];
		let p3Lat = getCoords(req.params.p3)[1];
		let p4Long = getCoords(req.params.p4)[0];
		let p4Lat = getCoords(req.params.p4)[1];

		const livrarias = await db.collection("livrarias").find({
			geometry: {
				$geoWithin: {
					$geometry: {
						type: "Polygon",
						coordinates: [
							[
								[p1Long, p1Lat], [p2Long, p2Lat], [p3Long, p3Lat], [p4Long, p4Lat], [p1Long, p1Lat]
							]
						]
					}
				}
			}
		}).project({ _id: 0, type: 0, books: 0 }).toArray();
		res.send(livrarias).status(200);
	} catch (error) {
		res.send({ message: "Erro ao consultar livrarias", error: error.message }).status(500);
	}
})

//Endpoint 5
router.get('/lib/:lat/:lng', async (req, res) => {
	try {
		const raioProcura = 1; //Equivale a 1 Km
		const raioTerra = 6378.1;
		//Usar o countDocuments em vez do count para contar as ocurrências
		const livrarias = await db.collection("livrarias").countDocuments({
			geometry: {
				$geoWithin: {
					$centerSphere: [
						// A divisão é efetuada para converter radianos para kilometros dividindo o raio de procura pelo raio da terra
						[parseFloat(req.params.lat), parseFloat(req.params.lng)], raioProcura / raioTerra
					]
				}
			}
		}
		);
		res.send({ message: "Número de livrarias: " + livrarias.toString() }).status(200);
	} catch (error) {
		res.send({ message: "Erro ao apresentar as livrarias mais próximas", error: error.message }).status(500);
	}
})


// 6. Verificar se um determinado usuário (Ponto) se encontra dentro da feira do livro
//Coordenadas dentro da feira do livro para teste: -9.153229526069271,38.72904762938384
//Coordenadas fora do parque para teste: -9.155644342145884,38.72749043040882
//Coordenadas dentro da feira semanal para teste: -9.1457748,38.7353616

router.get('/feiralivro/contains/:coords', async (req, res) => {
	try {
		// Converter as coordenadas do usuário com a função getCoords
		let p1Long = getCoords(req.params.coords)[0];
		let p1Lat = getCoords(req.params.coords)[1];

		// Consultar a feira do livro usando o operador $geoIntersects
		const feiraDoLivro = await db.collection("livrarias").find({
			//_id: 15 da feira do livro
			_id: 15,
			geometry: {
				$geoIntersects: {
					$geometry: {
						type: "Point",
						coordinates:
							[p1Long, p1Lat]
					}
				}
			}
		}).toArray();
		if (feiraDoLivro.length > 0) {
			res.send({ message: "O usuário está dentro da área da feira do livro." }).status(200);

		} else {
			res.send({ message: "O usuário não está dentro da área da feira do livro." }).status(200);
		}

	} catch (error) {
		res.send({ message: "Erro", error: error.message }).status(500);
	}
})

export default router;


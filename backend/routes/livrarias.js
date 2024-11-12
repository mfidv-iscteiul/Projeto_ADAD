import express from "express";
import db from "../db/config.js";
const router = express.Router();

//  1. Adicionar livros da lista (books.json) a cada livraria.
router.post('/:id', async (req, res) => {
    const bookIds = Array.isArray(req.body) ? req.body : [req.body]; // Verifica se é um array ou um único ID

    try {
        const books = await db.collection("books").find({ _id: { $in: bookIds } }).toArray();

        if (books.length === 0) {
            return res.send({ message: "Nenhum livro encontrado" }).status(404);
        }

        const result = await db.collection("livrarias").updateOne(
            { _id: parseInt(req.params.id) },
            { $push: { books: { $each: books } } }
        );

        if (result.matchedCount === 0) {
            return res.send({ message: "Livraria não encontrada" }).status(404);
        }

        res.send({ message: "Livros adicionados à livraria com sucesso" }).status(201);
    } catch (error) {
        res.send({ message: "Erro ao adicionar livros", error: error.message }).status(500);
    }
});



// 2. Consultar livros numa livraria específica
router.get('/:id', async (req, res) => {

    try {
      const livraria = await db.collection("livrarias").findOne(
        { _id: parseInt(req.params.id) },
        { projection: { books: 1 } }
      );
  
      if (!livraria) {
        return res.send({ message: "Livraria não encontrada" }).status(404);
      }
  
      res.send(livraria.books).status(200);
    } catch (error) {
      res.send({ message: "Erro ao consultar livros", error: error.message }).status(500);
    }
  });

export default router;
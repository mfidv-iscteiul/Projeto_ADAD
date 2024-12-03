import express from "express";
import db from "../db/config.js";
const router = express.Router();

import { VerifyID } from './books.js'; // para ir buscar a funcao desenvolvida nos books

//endpoint 18

router.post("/", async (req, res) => {
    try {
        const comment = req.body;

        //Insere comentario
        const result = await db.collection("comments").insertOne(comment);
        res.send(result).status(200);

    } catch (error) {

        res.status(500).json({ message: "Erro ao adicionar comentários" });
    }
});



//endpoint 19

router.delete("/:id", async (req, res) => {
    try {
        
        const commentID = VerifyID(req.params.id);

        const result = await db.collection("comments").deleteOne({ 
            _id: commentID
        });

        if (result.deletedCount === 1) {
            res.send(result).status(200);
        }else{   // comentario nao encontrado
            res.status(404).json({ message: "comentario não encontrado." });
        }

    } catch (error) {
        res.status(500).json({ message: "Erro ao remover comentario" });
    }
});

export default router;
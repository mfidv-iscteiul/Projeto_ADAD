import express from "express";
import db from "../db/config.js";
const router = express.Router();


//endpoint 18

router.post("/", async (req, res) => {
    try {
        const comment = req.body;

        //Insere comentario
        const result = await db.collection("comments").insertOne(comment);
        res.send(result).status(200);

    } catch (error) {

        res.status(500).json({ message: "Erro ao adicionar usuários" });
    }
});



//endpoint 19

router.delete("/:id", async (req, res) => {
    const commentID = req.params.id;
    try {
        if (isNaN(commentID)) { //para verificar se é um objectId
            console.log("entrei no objeto");
            const result = await db.collection("comments").deleteOne(
                { _id: new ObjectId(commentID) });

            if (result.deletedCount === 1) {
                console.log("entrei no if");
                res.send(result).status(200);
            }
            else {   // comentario não encontrado

                res.status(404).json({ message: "comentario não encontrado." });
            }
        }
        else {//se o Id for um numero
            const result = await db.collection("comments").deleteOne(
                { _id: parseInt(commentID) });

            if (result.deletedCount === 1) { // Usuário removido com sucesso
                res.send(result).status(200);
            } else {
                // Usuário não encontrado
                res.status(404).json({ message: "comentario não encontrado." });
            }
        }
    } catch (error) {
        res.status(500).json({ message: "Erro ao remover comentario" });

    }
});

export default router;
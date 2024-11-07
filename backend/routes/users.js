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
router.post("/", async (req, res) => {
    try {
      const user = req.body;
  
      // Verifica se `users` é um array (vários usuários) ou um objeto (um único usuário)
      if (Array.isArray(user)) {
    
        // Insere vários usuários
        const result = await db.collection("users").insertMany(user);
        res.send(result).status(200);
         
    
      } else {
       
        // Insere um único usuário
        const result = await db.collection("users").insertOne(user);
        res.send(result).status(200);
      }
    } catch (error) {
    
      res.status(500).json({ message: "Erro ao adicionar usuários" });
    }
  });





//Endpoint 10
router.put("/:id", async (req, res) => {
    let results = await db.collection("users").updateOne(
        {_id: req.params.id},
        {$set: req.body}
    )

    res.send(results).status(200);
})

export default router;
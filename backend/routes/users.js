import express from "express";
import db from "../db/config.js";
import { ObjectId } from "mongodb";
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



  //endpoint 6
  router.get("/:id", async(req, res) => {
    try {
    const userID = isNaN(req.params.id) ? new ObjectId(req.params.id) : parseInt(req.params.id);

   const result = await db.collection("users").aggregate([
    {$match: {_id: userID}},
    { $unwind : "$reviews"},
    { $sort : {"reviews.score": -1 }},
    
   {$lookup: {
          from: "books",
          localField: "reviews.book_id",
          foreignField: "_id",
          as: "book_details"
}},
    {$limit : 3},
    {$group: {
      _id: userID,
      first_name: { $first: "$first_name" },
          last_name: { $first: "$last_name" },
      top3_books: {
        $push: {
          score: "$reviews.score",
          recommendation: "$reviews.recommendation",
          review_date: "$reviews.review_date",
          book_details: "$book_details" 
        }
      }
    }
    }
   ]).toArray();

   res.send(result).status(200);
  
  } catch (error) {
    console.error("Erro ao buscar usuário e livros:", error);
    res.status(500).json({ message: "Erro ao buscar usuário e livros." });
  }
} )




  //Endpoint 8
router.delete("/:id", async (req, res) => {
  const userID = req.params.id;
  try {
    if (isNaN(userID)) { //para verificar se e um objectId
      console.log("entrei aqui no objeto");
      const result = await db.collection("users").deleteOne(
            {_id: new ObjectId(userID)}); 

            if (result.deletedCount === 1) {
              console.log("entrei no if");
              res.send(result).status(200);
            }
            else {   // Usuário não encontrado
              
              res.status(404).json({ message: "Usuário não encontrado." });
            }
    }
    else{//se o Id for um numero
        const result = await db.collection("users").deleteOne(
        {_id: parseInt(userID)}); 

        if (result.deletedCount === 1) { // Usuário removido com sucesso
          res.send(result).status(200); 
        }else {
          // Usuário não encontrado
          res.status(404).json({ message: "Usuário não encontrado." });
        }
    }
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover usuário." });

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
import express from "express";
import db from "../db/config.js";
const router = express.Router();

import { Pagination } from './books.js'; // para ir buscar a funcao de paginação nos books
import { VerifyID } from './books.js'; // para ir buscar a funcao desenvolvida nos books

//Endpoint 2

router.get("/", async(req, res) => {

    try {
      
      let results = await db.collection("users").find({})
      .sort({_id : 1})
      .toArray();

      let data = Pagination(results, parseInt(req.query.page));

      if (req.query.page > data.maxPages) {return res.send( {message: "Esta página não existe"}).status(404)};

      res.send(data).status(200);

    } catch (error) {

      res.status(500).json({ message: "Erro a listar os users" });

    }
} )

//Endpoint 4
router.post("/", async (req, res) => {
    try {
      const user = req.body;
  
      

      // Verifica se `users` é um array (vários usuários) ou um objeto (um único usuário)
      if (Array.isArray(user)) {
    
        // Insere vários usuários
        const result = await db.collection("users").insertMany(user);

        if (result.insertedCount === 0) return res.send({ message: "Nenhum user adicionado" }).status(404);

        res.send(result).status(200);
         
    
      } else {
       
        // Insere um único usuário
        const result = await db.collection("users").insertOne(user);

        if (result.insertedCount === 0) return res.send({ message: "Nenhum user adicionado" }).status(404);

        res.send(result).status(200);
      }
    } catch (error) {
    
      res.status(500).json({ message: "Erro ao adicionar usuários" });
    }
  });



  //endpoint 6
  router.get("/:id", async(req, res) => {
    try {
    
      const userID = VerifyID(req.params.id);
    //const userID = isNaN(req.params.id) ? new ObjectId(req.params.id) : parseInt(req.params.id);

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
   if (result.length === 0) return res.send({ message: "User não encontrado" }).status(404);
   res.send(result).status(200);
  
  } catch (error) {
   
    res.status(500).json({ message: "Erro ao buscar usuário e livros." });
  }
} )




  //Endpoint 8
router.delete("/:id", async (req, res) => {
  const userID = VerifyID(req.params.id);
  //const userID = isNaN(req.params.id) ? new ObjectId(req.params.id) : parseInt(req.params.id);
  try {
   
      const result = await db.collection("users").deleteOne(
            {_id: userID}); 

            if (result.deletedCount === 1) {
            
              res.send(result).status(200);
            }
            else {   // Usuário não encontrado
              
              res.status(404).json({ message: "Usuário não encontrado." });
            }
    
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover usuário." });

  }
});





//Endpoint 10
router.put("/:id", async (req, res) => {
  try{
    function dealWithResults(results){
      if(results.modifiedCount ===  1){
        return res.send({message: "User atualizado com sucesso"}).status(200);
      }else if (results.modifiedCount ===  0 && results.matchedCount ===  1) {
        return res.send({message: "Informação para atualizar igual à enviada"}).status(200);
      }
      res.send({message: "User não encontrado"}).status(404);
    }

    const userID = VerifyID(req.params.id);
		let newReviews = req.body.reviews;

    if(newReviews.length > 0){
      var oldReviews = await db.collection("users").find({_id: userID}).project({_id: 0, reviews: 1}).toArray();
    }

    let results = await db.collection("users").updateOne(
      {_id: userID},
      {$set: req.body},
    ) 

    if(newReviews.length > 0 && oldReviews[0].reviews.length > 0){
      var reviewResults = await db.collection("users").updateOne(
        {_id: userID},
        {$push: {reviews: {$each: oldReviews[0].reviews}}}
      )

      return dealWithResults(reviewResults);
    }
    
    return dealWithResults(results);

  } catch (error){
    res.send({ message: "Erro ao atualizar User." }).status(500);
  }
})

export default router;
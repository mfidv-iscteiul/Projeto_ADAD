import express from "express";
import db from "../db/config.js";
const router = express.Router();


function getCoords(point){
  const intCoords = [];
  const coords = point.split(",");
  coords.forEach((coord) => {
    intCoords.push(parseFloat(coord));
  });
  return intCoords;
}



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

// 3. Lista de livrarias perto de uma localização
router.get('/near/:p1', async (req, res) => {
  try {

  const results= await db.collection("livrarias").find({
    geometry:{
      $near:{
        $geometry:{
          type:"Point", 
          coordinates:[getCoords(req.params.p1)[0],getCoords(req.params.p1)[1] ],
         
        },
          $maxDistance: 2000
      }
    }
    


  }).project({_id: 1, 
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
        geometry:{
          $geoWithin: {
            $geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [ p1Long, p1Lat ], [ p2Long, p2Lat ], [ p3Long, p3Lat] , [ p4Long, p4Lat ], [ p1Long, p1Lat ]
                ]
              ]
            }
          }
        }
      }).project({_id: 0, type: 0, books: 0}).toArray();

      res.send(livrarias).status(200);
    } catch (error) {
      res.send({ message: "Erro ao consultar livrarias", error: error.message }).status(500);
    }
  })

export default router;
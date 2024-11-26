import React, { useState, useEffect } from "react";
import CardGroup from "react-bootstrap/CardGroup";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

import BookCard from "../components/BookCard";

export default function App() {
  let [books, setBooks] = useState([]); // Estado para armazenar os livros
  let [page, setPage] = useState([]); // Estado para a página atual
  let [maxPages, setMaxPages] = useState([]); // Estado para o número máximo de páginas

  const getBooks = async (page) => {
    try {

      const response = await fetch(`http://localhost:3000/books?page=${page}&limit=20`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      setBooks(data.books);
      setPage(data.page);
      setMaxPages(data.maxPages);

    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    getBooks(page);
  }, [page]);

  function handleClick(newPage) {
    setPage(newPage);
  }

  return (
    <div className="container pt-5 pb-5">
      <h2>Books</h2>
      
      <CardGroup>
        <Row xs={1} md={2} className="d-flex justify-content-around">
          {books &&
            books.map((book) => {
              return <BookCard key={book._id} {...book} />;
            })}
        </Row>

      </CardGroup>
      <div className="pagination-buttons mt-3 d-flex justify-content-center">
        {/* Botão para página anterior */}
        
        <Button
          onClick={() => handleClick(Math.max(page - 1, 1))}
          disabled={page === 1} // Desativado na primeira página
        >
          Previous
        
        </Button>
        <span className="mx-3 ">Page : {page}/{maxPages}</span>
        {/* Botão para próxima página */}
        <Button
          onClick={() => handleClick(page + 1)}
          disabled={page === maxPages} // Desativado se não houver mais itens
        >

          Next
        </Button>

      </div>
    </div>
  );
}

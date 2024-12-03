import React, {useState, useEffect} from "react";
import CardGroup from 'react-bootstrap/CardGroup';
import Row from 'react-bootstrap/Row';
import Button from "react-bootstrap/Button";
import UserCard from "../components/UserCard";

export default function App() {
  let [users, setUsers] = useState([]);
  let [page, setPage] = useState([]); // Estado para a página atual
  let [maxPages, setMaxPages] = useState([]); // Estado para o número máximo de páginas

  const getUsers = async (page) => {
    try {
      const response = await fetch(`http://localhost:3000/users?page=${page}`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json'
        },
      });
      
      const data = await response.json();
      console.log(data)
      setUsers(data.results);
      setPage(data.page);
      setMaxPages(data.maxPages);

    } catch (error) {
      console.error('Error:', error);
    }
  }

  useEffect(() => {
    getUsers(page);
  }, [page]);

  function handleClick(newPage) {
    setPage(newPage);
  }

  return (
    <div className="container pt-5 pb-5">
      <h2>Users</h2>
      <CardGroup>
            <Row xs={1} md={2} className="d-flex justify-content-around">
            {users && users.map((user) => {
                return (
                    <UserCard 
                        key={user._id} 
                        {...user}
                    />
                );
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
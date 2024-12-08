import React, {useState, useEffect} from "react";
import CardGroup from "react-bootstrap/CardGroup";
import Row from "react-bootstrap/Row";
import BookCard from "../components/BookCard";
import { useParams, useNavigate } from "react-router-dom";
import {
  bufferCV,
} from '@stacks/transactions';
import { utf8ToBytes } from '@stacks/common';
const bytes = utf8ToBytes('foo'); 
const bufCV = bufferCV(bytes);

export default function App() {
  let params = useParams();
  let [user, setUser] = useState([]);

  	const getUser = async (id) => {
		  try {
			  const response = await fetch(`http://localhost:3000/users/${id}`, {
				  method: 'GET',
				  headers: {
					  'Content-Type': 'application / json',
				  },
			  });
			  const data = await response.json();
			  setUser(data);
	  	} catch (error) {
		  	console.error('Error:', error);
		  }
  	};

	useEffect(() => {
		getUser(params.id);
	}, [params.id]);

  return (
    <div className="container pt-5 pb-5">
		<h1><strong>{user.first_name} {user.last_name}</strong></h1>
		<p><strong>Job:</strong> {user.job}</p>
		<p><strong>Year of birth:</strong> {user.year_of_birth}</p>
		<div style={{display: "flex", justifyContent: "space-evenly"}}>
		{user.top3_books &&
			user.top3_books.map((book) => {
				let userBookCard = <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
					<div style={{display: "flex", alignItems: "stretch", flexGrow: "1"}}><BookCard key={book.book_details[0]._id} {...book.book_details[0]} /></div>							
					<p style={{ fontSize: "1.3em" }}><span style={{ fontSize: "1.5em" }}><strong>{book.score}</strong></span>/5</p>
					{book.recommendation ? <p style={{padding: "9px", color: "#3c3c3c", backgroundColor: "rgba(0, 215, 24, 0.62)", borderRadius: "25px"}}>"Recomendo!"</p> : <p style={{padding: "9px", color: "#3c3c3c", backgroundColor: "rgba(217, 0, 0, 0.74)", borderRadius: "25px"}}>"Não Recomendo"</p>}
					<p>{new Date(parseInt(book.review_date)).toLocaleDateString()}</p>
				</div>;
				return userBookCard;
			})}
		</div>
    </div>
  )
}
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	bufferCV,
} from '@stacks/transactions';
import { utf8ToBytes } from '@stacks/common';
const bytes = utf8ToBytes('foo');
const bufCV = bufferCV(bytes);

export default function App() {
	let params = useParams();
	let [book, setBook] = useState([]);
	let i = 0;

	const getBook = async (id) => {
		try {
			const response = await fetch(`http://localhost:3000/books/id/${id}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application / json',
				},
			});
			const data = await response.json();
			setBook(data);
		} catch (error) {
			console.error('Error:', error);
		}
	};

	useEffect(() => {
		getBook(params.id);
	}, [params.id]);

	return (
		<div className="container pt-5 pb-5">
			<div style={{ display: "flex", justifyContent: "center" }}>
				<div>
					<img src={book.thumbnailUrl} alt={book.title} style={{ width: "300px", flexShrink: "0" }} />
				</div>
				<div style={{ marginLeft: "40px", paddingBottom: "16px", display: "flex", flexDirection: "column" }}>
					<h1><strong>{book.title}</strong></h1>
					<h5>De</h5>
					<ul style={{ listStyle: "none" }}>
						{book.authors &&
							book.authors.map((author) => {
								return <li key={i++}>{author}</li>;
							})}
					</ul>
					<p style={{ fontSize: "1.3em" }}><span style={{ fontSize: "1.5em" }}><strong>{Math.round(book.averageScore * 100) / 100}</strong></span>/5 estrelas</p>
					<h3 style={{ marginTop: "auto" }}><strong>{book.price}€</strong></h3>
				</div>
			</div>
			<hr></hr>
			<h2>Sinopse</h2>
			<p>{book.longDescription}</p>
			<h2>Detalhes</h2>
			<p><strong>ISBN:</strong> {book.isbn}</p>
			<p><strong>Nº páginas:</strong> {book.pageCount}</p>
			<p><strong>Data de publicação:</strong> {new Date(book.publishedDate).toLocaleDateString()}</p>
			<p><strong>Categorias:</strong></p>
			<ul>
						{book.categories &&
							book.categories.map((categorie) => {
								return <li key={i++}>{categorie}</li>;
							})}
			</ul>
			<h2>Comentários</h2>
			<ul style={{ listStyle: "none" }}>
    			{book.comments &&
       				book.comments.map((comment) => {
            			return (
               			<li key={comment._id}>
                    		<h6><strong>{comment.name}</strong></h6>
                    		<p>{comment.comment}</p>
                		</li>
            			);
        		})}
			</ul>

		</div>
	)
}

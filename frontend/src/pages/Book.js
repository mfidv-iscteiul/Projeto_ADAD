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
			<h2>Book page</h2>
			<img src={book.thumbnailUrl} alt={book.title} />
			<p><strong>Title:</strong> {book.title}</p>
			<p><strong>Id:</strong> {book._id}</p>
			<p><strong>Nº páginas:</strong> {book.pageCount}</p>
			<p><strong>Descrição:</strong> {book.shortDescription}</p>
			<p><strong>Preço:</strong> {book.price}</p>

		</div>
	)
}

import React, {useState, useEffect} from "react";
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
    </div>
  )
}
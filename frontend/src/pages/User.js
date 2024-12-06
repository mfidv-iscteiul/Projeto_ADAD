import React, {useState, useEffect} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { openContractCall } from '@stacks/connect';
import {
  bufferCV,
} from '@stacks/transactions';
import { utf8ToBytes } from '@stacks/common';
import { userSession } from '../auth';
import UserPage from "../components/UserPage";
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
    
    let id = params.id;
    console.log(id);
    getUser(id);

  }, [params.id]);

  return (
    <div className="container pt-5 pb-5">
      <h2>User page</h2>
			<p><strong>Name:</strong> {user.first_name}</p>
			<p><strong>Id:</strong> {user._id}</p>
			<p><strong>Job:</strong> {user.job}</p>
			<p><strong>Year of birth:</strong> {user.year_of_birth}</p>

    </div>
  )
}
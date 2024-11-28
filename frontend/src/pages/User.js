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
  let [book, setBook] = useState([]);

 

  useEffect(() => {
    let id = params.id;
    console.log(id);
    //getUser(params.id);

  }, []);

  return (
    <div className="container pt-5 pb-5">
      <h2>Book page</h2>
      <p>use /book/:id endpoint</p>
      <UserPage>
      
</UserPage>
      
    </div>
  )
}
import React, { useEffect, useState, useRef } from 'react';
import './App.scss';
import axios from 'axios';

export default function App() {
  const [query, setQuery] = useState('');
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    axios({
      method: 'GET',
      url: 'http://openlibrary.org/search.json',
      params: {
        q: query,
        page: pageNumber
      }
    }).then(console.log)
  }, [query, pageNumber]);

  return (
    <div className="App">
      <Form 
        queryState={[query, setQuery]} 
        pageNumberState={[pageNumber, setPageNumber]}
      />
      <div className="content-container"></div>
    </div>
  );
};

const Form = ({ queryState, pageNumberState }) => {
  const [query, setQuery] = queryState
  const [pageNumber, setPageNumber] = pageNumberState;

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPageNumber(1)
  };

  const handleDelete = (e) => {
    setQuery('');
  }

  return (
    <form className="Form">
      <input type="text" autoCorrect="false" autoComplete="false" spellCheck="false" onChange={handleSearch} value={query}/>
      <button className="del-icon" onClick={handleDelete}>
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
          <line x1="19" y1="5" x2="5" y2="19" strokeMiterlimit="10"/>
          <line x1="5" y1="5" x2="19" y2="19" strokeMiterlimit="10"/>
        </svg>
      </button>
    </form>
  )
};
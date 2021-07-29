import React, { useEffect, useState, useRef } from 'react';
import './App.scss';
import axios, { CancelToken } from 'axios';

export default function App() {
  const [query, setQuery] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setBooks([]);
  }, [query]);

  useEffect(() => {   
    let cancel;

    if (query === '') {
      setBooks([]);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      setIsError(false);

      axios({
        method: 'GET',
        url: 'http://openlibrary.org/search.json',
        params: {
          q: query,
          page: pageNumber
        },
        cancelToken: new CancelToken(token => cancel = token)
      }).then(res => {
        setBooks(prevBooks => {
          const appendNewBooks = [...res.data.docs.map(book => {
            return {
              title: book.title,
              author: book.author_name
            }
          })];
          return appendNewBooks;
          // Set: prevent duplicate data 
          // return [...new Set(appendNewBooks)];
        })
        console.log(res.data.docs)
        setHasMore(res.data.docs.length > 0)
        setIsLoading(false);
      })
        .catch(e => {
          if (axios.isCancel(e)) return;
          setIsError(true);
        });
    }

    return () => {
      cancel && cancel();
    };
  }, [query, pageNumber]);

  return (
    <div className="App">
      <Form 
        queryState={[query, setQuery]} 
        pageNumberState={[pageNumber, setPageNumber]}
      />
      {/* {books.map(book => {
        return (
          <div>
            <h4>{book.title}</h4>
            <p>{book.author}</p>
          </div>
        )
      })} */}
      {isLoading && <p>loading jing...</p>}
      {isError && <p>error jing...</p>}
      <div className="content-container">
        {books.map(book => {
          return (
            <div>
              <h4>{book.title}</h4>
              <p>{book.author}</p>
            </div>
          )
        })}
      </div>
      {}
    </div>
  );
};

const Form = ({ queryState, pageNumberState }) => {
  const [query, setQuery] = queryState
  const [pageNumber, setPageNumber] = pageNumberState;

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(e.target.value);
    setPageNumber(1)
  };

  const handleDelete = (e) => {
    setQuery('');
  }

  return (
    <div className="Form">
      <input type="text" placeholder="Search book title" autoCorrect="false" autoComplete="false" spellCheck="false" onChange={handleSearch} value={query}/>
      <button className="del-icon" onClick={handleDelete}>
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24">
          <line x1="19" y1="5" x2="5" y2="19" strokeMiterlimit="10"/>
          <line x1="5" y1="5" x2="19" y2="19" strokeMiterlimit="10"/>
        </svg>
      </button>
    </div>
  )
};
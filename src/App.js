import React, { useEffect, useState, useRef, useCallback } from 'react';
import './App.scss';
import axios, { CancelToken } from 'axios';

export default function App() {
  const [query, setQuery] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const observer = useRef();
  const lastBookRef = useCallback(el => {
    // prevent calling API constantly
    if (isLoading) return;

    // disconnect previous observer
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPageNumber(prevPage => prevPage + 1);
      }
    })
    if (el) observer.current.observe(el);
  }, [isLoading, hasMore]);

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
          const appendNewBooks = [...prevBooks, ...res.data.docs.map(book => {
            return {
              title: book.title,
              author: [book.author_name]
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
      if (cancel) cancel();
    };
  }, [query, pageNumber]);

  return (
    <div className="App">
      <Form 
        queryState={[query, setQuery]} 
        pageNumberState={[pageNumber, setPageNumber]}
      />
      <div className="content-container">
        {books.map((book, i) => {
          if (books.length === i + 1) {
            return (
              <div ref={lastBookRef} key={i}>
                <h4>{book.title}</h4>
                <p>{book.author}</p>
              </div>
            )
          } else {
            return (
              <div key={i}>
                <h4>{book.title}</h4>
                <p>{book.author}</p>
              </div>
            )
          }
        })}
        {isLoading && <p>loading...</p>}
        {isError && <p>error</p>}
      </div>
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
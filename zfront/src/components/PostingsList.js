import React, { useState, useEffect } from 'react';
// import { Link, useHistory } from 'react-router-dom';
import { Button } from 'semantic-ui-react';

import PostingAxios from '../services/PostingAxios';
import PostingModal from "./PostingModal";


const PostingsList = () => {
  const [postings, setPostings] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  // const history = useHistory();

  useEffect(() => {
    retrievePostings();
  }, []);               // C: '[]' means useEffect will only run THE FIRST time the page renders, not every time it renders

  const retrievePostings = () => {
    PostingAxios.getAll()
      .then((response) => {
        setPostings(response.data);
        console.log('PostingsList.js retrievePostings() response.data=', response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onChangeSearchTitle = (evnt) => {
    const searchTitle = evnt.target.value;
    setSearchTitle(searchTitle);
    console.log('searchTitle=', searchTitle);
  };

  const onClickFindByTitle = () => {
    PostingAxios.findByTitle(searchTitle)
      .then((response) => {
        setPostings(response.data);
        console.log("PostingsList.js onClickFindByTitle() response.data=",response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const removeAllPostings = () => {
    PostingAxios.removeAll()
      .then(response => {
        console.log(response.data);
        refreshList();
      })
      .catch(e => {
        console.log(e);
      });
  };

  const refreshList = () => {
    retrievePostings();
  };


  return (
    <div>
      
      {/* Navbar */}
      <nav className="w-full h-20 flex flex-row items-center text-blue-200 bg-blue-900">
        
        <div className="text-2xl mx-4">
            Helpful Postings
        </div>

        <div className="mx-4 hover:text-blue-800">
          <PostingModal refresh={retrievePostings} />
        </div>


        {/* Search bar */}
        <div className="flex flex-row mx-4">
          
          <input type="text"  className="w-100 p-1 bg-gray-100 rounded-lg"  
            placeholder=" Search by Title"
            value={searchTitle}  onChange={onChangeSearchTitle}>
          </input>

          <button className="ml-2 px-3 text-gray-800 bg-gray-300 rounded-lg" onClick={onClickFindByTitle}>
            Search
          </button>

        </div>
      </nav>



      {/* Postings List */}
      <div className="col-md-6 mt-3">
        <h4>Postings List</h4>
      
        <div className="list-group">
          {postings && postings.map((posting, index) => (     // J: render if postings isn't NULL
            <div key={index}>
                <PostingModal posting={posting} refresh={retrievePostings} />
                {/* setPosts={setPostings} */}
            </div>
          ))}
        </div>

        {/* <Button className="mt-3" onClick={() => history.push('/addposting')}>
          Add Posting
        </Button> */}

        <Button className="mt-3" basic color='red' onClick={removeAllPostings}>
          Remove All
        </Button>

      </div>
    
    </div>
  );
};

export default PostingsList;

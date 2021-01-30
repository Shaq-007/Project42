import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";

import PostingAxios from "../services/PostingAxios";
import MainModal from "./MainModal";
import WelcomeModal from "./WelcomeModal";
import retrievePostings from "../functions/retrievePostings";   
import deletePost from "../functions/deletePost";


const PostingsList = () => {
  const emptyPost = {
    _id: null, //  It'd be better if we used 0
    title: "",
    contributors: "",
    description: "",
    tags: "",
    contentType: "",
    spiciness: 0,
    upvotes: 0,
  };

  const [postingsDataArray, setPostingsDataArray] = useState([emptyPost]);
  const [currPostIndex, setCurrPostIndex] = useState(0); //points to which element in the postings array that we're interested in

  const [searchTitle, setSearchTitle] = useState("");
  const [showMainModal, setShowMainModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  // const [loading, setLoading] = useState(true)


  useEffect(() => {
    retrievePostings();
  }, []); // C: '[]' means useEffect will only run THE FIRST time the page renders


  //J: handleInputChange has been fixed up (29JAN2021)
  const handleInputChange = (evnt, currPostIndx) => {
    // Leave in PostingList.js for now: this function uses state vars 'postingsDataArray' and 
    // 'currPostIndex' (assumed global and current). Assumes postingsDataArray != null,  currPostIndex >= 0
    const { name, value } = evnt.target;
    const currPost = postingsDataArray[currPostIndx];
    const alteredPost = { ...currPost, [name]: value };
    // NB The brackets [] around 'name' in the above line are so that js
    // uses the VALUE of name for the key, and not just the string 'name'.

    console.log("handleInputChange: name =", name);
    console.log("handleInputChange: value =", value);
    console.log("handleInputChange: postings[currPostIndex] =", currPost);
    console.log("handleInputChange: newPost =", alteredPost);

    setPostingsDataArray((currDataArr) => {
      let newPostingsArr = [...currDataArr];
      newPostingsArr[currPostIndx] = alteredPost;
      console.log("handleInputChange: newPostingsArray =", newPostingsArr);
      return newPostingsArr;
    });
  };


  //J: THIS FUNCTION HAS NOT BEEN FIXED UP YET (as of 29JAN2021)
  const updateOrCreatePost = () => {
    // Runs when 'Save' button on modal is clicked
    console.log("updateOrCreatePost(), currPostIndex=", currPostingIndex);

    if (currPostingIndex) {
      console.log("updateOrCreatePost(): updating db...");

      PostingAxios.update(postingsDataArray[currPostingIndex]._id, postingsDataArray[currPostingIndex])
        .then((response) => {
          console.log("updateOrCreatePost(), response=", response);
          // replacePost(currPostIndex);                             // THERE IS NO replacePost FUNCTION!!
          setShowMainModal(false);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      createPost(post);
    }
  };


  //J: THIS FUNCTION HAS NOT BEEN FIXED UP YET (as of 29JAN2021)
  const createPost = (pst) => {
    console.log("Running PostModal.js createPost()");

    if (pst) {
      //J: The elements in the following object need to align with those in:
      //      const posting = new mongooseModel({...}) in postingController.js
      //and   var postingSchema = mongoose.Schema({ ... } in mongooseModel.js
      var postSubset = {
        title: pst.title,
        contributors: pst.contributors,
        description: pst.description,
        tags: pst.tags,
        contentType: pst.contentType,
        spiciness: pst.spiciness,
        upvotes: pst.upvotes,
      };
      // NB: other fields of 'post' may be empty. e.g. post._ID = null

      PostingAxios.create(postSubset)
        .then((response) => {
          console.log("PostModal.js: handling response to PostingAxios.create");

          const newPost = response.data;
          setPost(() => newPost);

          console.log("PostModal.js, createPost, newPost=response.data=", newPost);
          updatePostingsArray(newPost);
          setShowMainModal(false);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log("PostModal.js, createPost: Error - falsy post data passed to createPost()");
    }
  };



//J: LOOKS GOOD TO GO. MOVE TO SEPARATE FILE (29JAN2021)
  const deletePost = (postingsDataArr, setPostingsDataArr, currPostIndx) => {

    console.log("PostModal.js- deletePost() postingsDataArr=",postingsDataArr);
    console.log("PostModal.js- deletePost() setPostingsDataArr=",setPostingsDataArr);
    console.log("PostModal.js- deletePost() currPostIndx=",currPostIndx);

    if (postingsDataArr && postingsDataArr[currPostIndx]) {
      PostingAxios.remove(pst._id)
      .then((response) => {
        console.log("PostModal.js- deletePost(), response=", response);
      
        setPostingsDataArr((currDataArr) => {
          let newPostingsArr = [...currDataArr];
          newPostingsArr.splice(currPostIndx,1);    // remove 1 item by index
          console.log("PostModal.js- deletePost(): newPostingsArray =", newPostingsArr);
          return newPostingsArr;
        })
      })
      .catch((err) => {
        console.log(err);
      });
      
    } else {
      console.log("PostModal.js, deletePost: Error - received falsy array/index data passed");
    }
  };



  //J: THIS FUNCTION HAS NOT BEEN FIXED UP YET (as of 29JAN2021)    INDEED IS IT NECESSARY ANY MORE???
  const updatePostingsArray = (newPost) => {
    // Pass this via props to PostModal.js
    console.log("Running updatePostingsArray()");
    console.log("PostingsList.js, updatePostingsArray: newPost=", newPost);
    console.log("PostingsList.js, updatePostingsArray: initially, postings=", postingsDataArray);

    if (newPost && newPost._id && postingsDataArray) {
      const idOfNewPost = newPost._id;
      const indexOfPostToReplace = postingsDataArray.findIndex((currPost) => currPost._id === idOfNewPost);

      console.log("PostingsList.js, ditto: postings[indexOfPostToReplace]=", postingsDataArray[indexOfPostToReplace]);
      console.log("PostingsList.js, ditto: idOfNewPost=", idOfNewPost);
      console.log("PostingsList.js, ditto: indexOfPostToReplace=", indexOfPostToReplace);

      if (indexOfPostToReplace === -1) {
        // if no match is found append new posting to end of postings array
        setPostings((curr) => [...curr, newPost]);
      } else {
        // Replace old post (with matching _id) with newPost
        setPostings((curr) => {
          let updatedPostings = [...curr]; // NB: You can't do updatedPostings = curr here. You need to
          // spread then combine the curr array or you'll actually be modifying the state variable 'postings'.
          // Also you want to have this as a fat arrow function within the setPostings fn so that it's evaluated
          // all at once when setPostings is invoked, so you don't fall into an 'async hole'
          updatedPostings[indexOfPostToReplace] = newPost;
          console.log("PostingsList.js, ditto, updatedPostings=", updatedPostings);
          return updatedPostings;
        });
      }
    }
  };

  const onChangeSearchTitle = (evnt) => {
    const searchTitle = evnt.target.value;
    setSearchTitle(searchTitle);
    console.log("searchTitle=", searchTitle);
  };

  const onClickFindByTitle = () => {
    PostingAxios.findByTitle(searchTitle)
      .then((response) => {
        setPostings(response.data);
        console.log("onClickFindByTitle() response.data=", response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const removeAllPostings = () => {
    console.log("Running removeAllPostings()");

    PostingAxios.removeAll()
      .then((response) => {
        setPostings(response.data);
        console.log("removeAllPostings() response.data=", response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //uses state var
  //J: THIS FUNCTION HAS NOT BEEN FIXED UP YET (as of 29JAN2021)
  const RenderStubs = () => {
    console.log("ListPostings: postings=", postingsDataArray);

    if (postings[0]._id) {
      return (
        <>
          {postingsDataArray.map((pst, indx) => {
            console.log("RenderStubs .map: indx=", indx, " and pst=", pst);

            return (
              <div
                key={indx}
                className="w-64 p-2 my-2 border border-gray-700 rounded-lg"
                onClick={() => {
                  setPost(pst);                         //J: DEPRECATED!!
                  setShowMainModal(true);
                }}>
                <div>{pst.title}</div>
                <div className="mt-2">{pst.contributors}</div>
              </div>
            );
          })}
        </>
      );
    } else {
      return <div> Please create a post </div>;
    }
  };

  // Main Page JSX
  return (
    <div>
      {/* Navbar */}
      <nav className="w-full h-20 flex items-center text-blue-200 bg-blue-900">
        <div className="flex flex-row items-baseline">
          <WelcomeModal show={showWelcomeModal} onHide={() => setShowWelcomeModal(false)} animation={false} />
          <div className="p-2 text-2xl mx-4  hover:text-blue-400" onClick={() => setShowWelcomeModal(true)}>
            Helpful Postings
          </div>

          <div
            className="mx-4 hover:text-blue-400"
            onClick={() => {
              setCurrPostIndex(-1); // use index of -1 to indicate a new, blank modal form
              setShowMainModal(true);
            }}>
            Create Post
          </div>

          {/* Search bar */}
          <div className="flex flex-row mx-4">
            <input
              type="text"
              className="w-100 p-1 text-gray-800 bg-gray-100 rounded-lg"
              placeholder=" Search by Title"
              value={searchTitle}
              onChange={onChangeSearchTitle}></input>
            <button
              className="ml-2 px-3 text-gray-800 bg-gray-300 rounded-lg  hover:text-blue-600"
              onClick={onClickFindByTitle}>
              Search
            </button>
          </div>
        </div>
      </nav>

      <RenderStubs />

      <MainModal
        postingsDataArr={postingsDataArray}
        currPostIndx={currPstIndex}
        setCurrPostIndx={setCurrPostIndex}
        setPostingsDataArr={setPostingsDataArray}
        emptyPst={emptyPost}
      />

      <Button variant="outline-danger" onClick={removeAllPostings}>
        [Dev Only] Remove All
      </Button>
    </div>
  );
};

export default PostingsList;

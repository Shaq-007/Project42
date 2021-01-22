import React, { useState, useEffect } from "react";
import PostingAxios from "../services/PostingAxios";

const PostingDetails = (props) => {

  const initialPostingState = {
    _id: null,
    title: "",
    contributors: "",
    description: "",
    published: false
  };
  
  const [selectedPosting, setSelectedPosting] = useState(initialPostingState);
  const [message, setMessage] = useState("");

  const [Loading, setLoading] = useState(true);


  const postingID = props.match.params.id      // J: get the ID of this posting from the match object. 
                  // The match object is one of three objects that are passed as props to the component by React Router.
                  // See https://reactrouter.com/web/api/Route/route-props
console.log("PostingDetails.js postingID from props.match.params.id=",postingID);

  useEffect(() => {
    console.log("PostingDetailss.js useEffect() postingID = props.match.params.id = ", postingID);
    getPostingDetails(postingID);
  }, [postingID]);             // J: run this useEffect any time postingID changes

  const getPostingDetails = (id) => {
    PostingAxios.get(id)
      .then(response => {
        setSelectedPosting(response.data);
        console.log("PostingDetailss.js getPostingDetails() response.data=",response.data);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const handleInputChange = (evnt) => {
    const { name, value } = evnt.target;
    setSelectedPosting({ ...selectedPosting, [name]: value });      // J: See Spread posting on 'Javascript 
                                                                      // Learning Tidbits' on Message Board
  };

  const updatePublished = (status) => {
    console.log("updatePublished1: selectedPosting=",selectedPosting)
    console.log("updatePublished1: selectedPosting._id=",selectedPosting._id)
    let data = {
      id: selectedPosting._id,          // J: i.e. no change to id, title or description
      title: selectedPosting.title,
      contributors: selectedPosting.contributors,
      description: selectedPosting.description,
      published: status
    };

    PostingAxios.update(selectedPosting._id, data)
      .then(response => {
        setSelectedPosting({ ...selectedPosting, published: status });
        console.log("updatePublished2: response.data=",response.data);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const updatePostingDetails = () => {
    PostingAxios.update(selectedPosting._id, selectedPosting)
      .then(response => {
        console.log(response.data);
        setMessage("updatePostingDetails(): The posting was updated successfully!");
      })
      .catch(e => {
        console.log(e);
      });
  };

  const deletePosting = () => {
    PostingAxios.remove(selectedPosting._id)
      .then(response => {
        console.log("deletePosting() response.data=",response.data);
        props.history.push("/postings");
      })
      .catch(e => {
        console.log(e);
      });
  };


const EditPostingDetails = ({selectedPost}) => {
return (
// Put content from below here. See lecture #26 (Mongo#1, 1:20:00)
<div>
  
</div>
)}




  return (

// Add conditional path based on Loading state variable (see line 17 above)

    <div>

      <EditPostingDetails selectedPost={selectedPosting} />

      {selectedPosting ? (
        <div className="edit-form">
          
          <h4>Edit Posting</h4>

{console.log("PostingDetails.js return selectedPosting=",selectedPosting)}   {/* J: I align temporary code like this all the way left */}

          <form>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                className="form-control"
                name="title"
                value={selectedPosting.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contributors">Contri</label>
              <input
                id="contributors"
                type="text"
                className="form-control"
                name="contributors"
                value={selectedPosting.contributors}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                id="description"
                type="text"
                className="form-control"
                name="description"
                value={selectedPosting.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>
                <strong>Status:</strong>
              </label>
              {selectedPosting.published ? "Published" : "Pending"}
            </div>
          </form>

          {selectedPosting.published ? (
            <button className="badge badge-primary mr-2" onClick={() => updatePublished(false)}>
              UnPublish
            </button>
          ) : (
            <button className="badge badge-primary mr-2" onClick={() => updatePublished(true)}>
              Publish
            </button>
          )}

          <button className="badge badge-danger mr-2" onClick={deletePosting}>
            Delete
          </button>

          <button type="submit" className="badge badge-success" onClick={updatePostingDetails}>
            Update
          </button>
          <p>{message}</p>
        </div>
      ) : (
        <div>
          <br />
          <p>Please click on a Posting...</p>
        </div>
      )}
    </div>
  );
};

export default PostingDetails;
import React, { useState, useRef, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import convertISODate from "../functions/convertISODate";
import RichTextEditor from "./RichTextEditor";
import ContentTypeSelector from "./ContentTypeSelector";
import SpicinessSelector from "./SpicinessSelector";
import VoteCounter from "./VoteCounter";
import WarningModalEdits from "./WarningModalEdits";
import { AiOutlineUser, AiOutlineTags } from "react-icons/ai";
import { BiBullseye } from "react-icons/bi";
import submitPost from "../functions/submitPost";
import WarningDeleteModal from "../components/WarningDeleteModal";
import unlockPost from "../functions/unlockPost";

const MainModal = (props) => {
  const emptyPost = props.emptyPost;
  let currPostIndex = props.currPostIndex;
  let showMainModal = props.showMainModal;
  const setShowMainModal = props.setShowMainModal;
  let postingsDataArray = props.postingsDataArray;
  const setPostingsDataArray = props.setPostingsDataArray;
  let postDraft = props.postDraft;
  const setPostDraft = props.setPostDraft;
  let creatingPostFlag = props.creatingPostFlag;
  let userVoted = props.userVoted;
  const setUserVoted = props.setUserVoted;
  const recdLog=props.recdLog;

  const [showWarningModalEdits, setshowWarningModalEdits] = useState(false);
  const [showWarningDeleteModal, setShowWarningDeleteModal] = useState(false);
  let madeEdits = useRef();


  useEffect(() => {
    madeEdits.current = false;
  }, []);

  console.log("MainModal.js Begins.");
  // console.log("MainModal.js: postDraft=", postDraft);


  const handleInputChange = (evnt) => {
    //J: This could be called updatePostDraft()
    madeEdits.current = true;
    console.log("handleInputChange madeEdits.current =", madeEdits.current);

    console.log("MainModal handleInputChange event=", evnt);
    const { name, value } = evnt.target;

    setPostDraft((currDraft) => {
      const newPostDraft = { ...currDraft, [name]: value };
      // Brackets [] around 'name' are so the VALUE of name is used for the key and not just the string 'name'.
      console.log("MainModal.js: handleInputChange: setting postDraft to", newPostDraft);
      return newPostDraft;
    });
  };

  // Switch focus to next input field when Enter is pressed
  function handleEnter(evnt) {
    // From: https://stackoverflow.com/questions/38577224/focus-on-next-field-when-pressing-enter-react-js
    if (evnt.keyCode === 13) {
      const form = evnt.target.form;
      const index = Array.prototype.indexOf.call(form, evnt.target);
      form.elements[index + 1].focus();
      evnt.preventDefault();
    }
  }

  const safeModalHide = (madeEdits) => {
    console.log("safeModalHide madeEdits.current =", madeEdits.current);

    if (madeEdits.current) {
      console.log("safeModalHide warning issued, showing WarningModalEdits", madeEdits.current);
      setshowWarningModalEdits(true);
    } else {
      setShowMainModal(false);
    }
    if (postDraft?._id) {
      unlockPost(postDraft, currPostIndex, recdLog);
    } else {
      console.log("unlockPost not called because postDraft?._id is falsy")
    }
  };

  return (
    <>
      <Modal
        size="lg"
        centered
        show={showMainModal}
        animation={false}
        onHide={() => {
          safeModalHide(madeEdits);
        }}
      >
        <form
          onSubmit={() => {
            // if (postDraft.contentType === "") {
            //   return (alert("You must select a Primary Content Type"));
            // }
            submitPost(
              emptyPost,
              postDraft,
              postingsDataArray,
              setPostingsDataArray,
              currPostIndex,
              setShowMainModal,
              creatingPostFlag
            );
          }}
        >

          {creatingPostFlag && (
            <Modal.Header>
              <div className="text-2xl">Create New Post</div>
            </Modal.Header>
          )}

          <Modal.Body>
            <>
              <input
                name="title"
                type="text"
                required
                maxLength="75"
                className="text-2xl w-full p-2 my-4 font-500 rounded-lg outline-none focus:bg-gray-200 hover:bg-gray-200"
                placeholder="Click to enter title of post here"
                value={postDraft.title}
                onChange={handleInputChange}
                onKeyDown={handleEnter}
              />
            </>

            {postDraft?.createdAt && postDraft.updatedAt ? ( // If there aren't any dates, just skip this
              <>
                <div className="flex flex-row p-2 mt-2">
                  {" "}
                  {/* Dates are read-only, and only shown for existing posts */}
                  <div className="flex flex-row">
                    <div className="font-500">Created:</div>
                    <div className="ml-2 font-400">{convertISODate(postDraft.createdAt)}</div>
                  </div>
                  <div className="flex flex-row ml-6">
                    <div className="font-500">Modified:</div>
                    <div className="ml-2 font-400">{convertISODate(postDraft.updatedAt)}</div>
                  </div>
                </div>
              </>
            ) : (
                <></>
            )}

            <div className="flex flex-row items-center p-1 mt-2">
              <AiOutlineUser size="30" className="text-blue-600"/>
              <input
                name="contributors"
                type="text"
                required
                className="modalField p-2 rounded-lg outline-none"
                placeholder="Enter firstname and last initial. (e.g. Margo P.)"
                value={postDraft.contributors}
                onChange={handleInputChange}
                onKeyDown={handleEnter}
              />
            </div>

            <div className="flex flex-row items-center p-1 mt-2">
              <AiOutlineTags size="30" className="text-blue-600"/>
              <input
                name="tags"
                type="text"
                className="modalField p-2 rounded-lg outline-none"
                placeholder="What tags are related to your post?"
                value={postDraft.tags}
                onChange={handleInputChange}
                onKeyDown={handleEnter}
              />
            </div>

            <div className="flex w-full p-1 mt-2">
              <BiBullseye size="28" className="mt-1.5 text-blue-600"/>
              <textarea
                name="purpose"
                type="text"
                className="modalField w-full p-2 outline-none rounded-lg"
                value={postDraft.purpose}
                placeholder="What does your post help readers accomplish?"
                onChange={handleInputChange}
              />
            </div>


            <div
              name="contentType-spiciness-upvote-container"
              className="flex pt-2 px-2 h-14 justify-between w-full"
            >
              <div className="w-1/3 mr-0.5 h-full flex justify-center items-center bg-gray-200 border-l border-r border-t rounded-t-lg">
                <ContentTypeSelector postDraft={postDraft} setPostDraft={setPostDraft}></ContentTypeSelector>
              </div>
              <div className="w-1/3 h-full flex justify-center items-center bg-gray-200 border-l border-r border-t rounded-t-lg">
                <SpicinessSelector postDraft={postDraft} setPostDraft={setPostDraft} />
              </div>
              <div className="w-1/3 ml-0.5 h-full flex justify-center items-center bg-gray-200 border-l border-r border-t rounded-t-lg">
                <VoteCounter
                  postingsDataArray={postingsDataArray}
                  index={-1}
                  postDraft={postDraft}
                  setPostDraft={setPostDraft}
                  userVoted={userVoted}
                  setUserVoted={setUserVoted}
                />
              </div>
            </div>


            <RichTextEditor postDraft={postDraft} setPostDraft={setPostDraft} />


          </Modal.Body>

          <Modal.Footer className="relative">
            <Button
              onClick={() => setShowWarningDeleteModal(true)}
              className="flex items-center self-start bg-white hover:bg-red-100 border-none text-red-400 absolute left-2 hover:text-red-600"
            >
              Archive Post
            </Button>
            <Button
                className="flex items-center self-start bg-white text-blue-600 border-blue-600 hover:text-blue-700 hover:border-blue-700 hover:bg-gray-100"
                onClick={() => {
                  console.log("MainModal.js Clicked Abandon Changes");
                  setShowMainModal(false);
                }}
              >
                Abandon Changes
            </Button>
            <Button type="submit" className="flex items-center bg-blue-600 hover:bg-blue-700 border-blue-600">
              Save Changes
            </Button>
          </Modal.Footer>
        </form>

        <WarningModalEdits showWarningModalEdits={showWarningModalEdits} setshowWarningModalEdits={setshowWarningModalEdits} />

        <WarningDeleteModal 
          showWarningDeleteModal={showWarningDeleteModal}
          setShowWarningDeleteModal={setShowWarningDeleteModal}
          postDraft={postDraft}
          setPostDraft={setPostDraft}
          postingsDataArray={postingsDataArray}
          setPostingsDataArray={setPostingsDataArray}
          currPostIndex={currPostIndex}
          setShowMainModal={setShowMainModal}
          creatingPostFlag={creatingPostFlag}
        />
      </Modal>
    </>
  );
};

export default MainModal;

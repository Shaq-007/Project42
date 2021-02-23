import React, { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button";

import NavBar from "./NavBar";
import MainModal from "./MainModal";
import TopicModal from "./TopicModal";
import RenderStubsDraggable from "./RenderStubsDraggable";
import RenderTopicsDraggable from "./RenderTopicsDraggable";
import retrievePosts from "../functions/retrievePosts";
import retrieveTopics from "../functions/retrieveTopics";
import ZoomPanNonDraggableStubs from "./ZoomPanNonDraggableStubs";
import unlockAll from "../functions/unlockAll";
import unarchiveAllPosts from "../functions/unarchiveAllPosts";
import unarchiveAllTopics from "../functions/unarchiveAllTopics";
import removeAllPosts from "../functions/removeAllPosts";
import removeAllTopics from "../functions/removeAllTopics";


const posnLog = false;  //  true logs Zoompan positions panX and panY
const recdLog = false;  //  true logs state variables aka 'records', e.g. postingsDataArray, postDraft, topicsDataArray
const evntLog = false;  //  true logs events, e.g. onClick, onKeyDown

const stubScale = 0.5;

const imageWidth = 7680; // Set these to equal background image dimensions
const imageHeight = 4320;
const initialPanX = 0;
const initialPanY = 80;

const extraZoomOutFactor = 0.9;
const minZoomScaleByWidth = (screen.width/imageWidth) * extraZoomOutFactor;
const minZoomScaleByHeight = (screen.height/imageHeight) * extraZoomOutFactor;
const minZoomScale = (minZoomScaleByWidth < minZoomScaleByHeight) ? minZoomScaleByWidth : minZoomScaleByHeight;

const emptyPost = {
  title: "",
  contributors: "",
  tags: "",
  contentType: "",
  spiciness: "",
  upvotes: 0,
  positionX: 200, // Coordinates for post's location. Don't confuse with panX & panY (screen pan distances)
  positionY: 200,
  locked: false,
  archived: false
};

const emptyTopic = {
  topic: "",
  topicLevel: "Main Topic",
  positionX: 200, // Coordinates for topic's location. Don't confuse with panX & panY (screen pan distances)
  positionY: 200,
};


const AlphaComponent = () => {

  useEffect ( ()=> {
    console.log ("AlphaComponent.js first run. minZoomScale=",minZoomScale);
    console.log ("based on screen.width=", screen.width, " and screen.height=", screen.height);
  }, [minZoomScale]);

  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [postingsDataArray, setPostingsDataArray] = useState();
  const [showMainModal, setShowMainModal] = useState(false);
  const [currPostIndex, setCurrPostIndex] = useState(0);
  const [postDraft, setPostDraft] = useState(emptyPost);
  const [creatingPostFlag, setCreatingPostFlag] = useState(false);
  const [userVoted, setUserVoted] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [zoomScale, setZoomScale] = useState(minZoomScale);
  const [panX, setPanX] = useState(initialPanX);
  const [panY, setPanY] = useState(initialPanY);

  const [topicsDataArray, setTopicsDataArray] = useState();
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [currTopicIndex, setCurrTopicIndex] = useState(0);
  const [topicDraft, setTopicDraft] = useState(emptyTopic);
  const [creatingTopicFlag, setCreatingTopicFlag] = useState(false);

  const stubsDraggable = useRef(null);
  const stubDragged = useRef(false);
  const topicDragged = useRef(false);
  // const zoomedOrPanned = useRef(false);
  // zoomedOrPanned.current = false;


  console.log("AlphaComponent.js begins...");
  recdLog && console.log("postingsDataArray=", postingsDataArray);
  recdLog && console.log("postDraft=", postDraft);
  recdLog && console.log("topicsDataArray=", topicsDataArray);
  recdLog && console.log("topicDraft=", topicDraft);

  const updateZoomPan = (stats) => {
    posnLog && console.log("AlphaComponent.js updateZoomPan() zoomScale=", stats.scale, ", panX=",stats.positionX, ', panY=',stats.positionY);
    setZoomScale(stats.scale);
    setPanX(stats.positionX);
    setPanY(stats.positionY);
    // zoomedOrPanned.current = true;
    // recdLog && console.log("updateZoomPan() zoomedOrPanned.current=", zoomedOrPanned.current);
  }


  const scrollToTopLeft = () => {   // from https://gist.github.com/romanonthego/223d2efe17b72098326c82718f283adb
    try {
      // trying to use new API - https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    } catch (error) {
      // just a fallback for older browsers
      console.log("Using fallback scrolling method")
      window.scrollTo(0, 0);
    }
  }

  const resetZoom = () => {
    setZoomScale(minZoomScale);
    setPanX(initialPanX);
    setPanY(initialPanY);
    scrollToTopLeft();
  }

  // useEffect(() => {
  //   window.focus()
  //   resetZoom();
  // }, []);


  useEffect(() => {
    // console.log("AlphaComponent.js useEffect zoomScale=", zoomScale);
    // console.log("AlphaComponent.js useEffect ref.current =", ref.current);
    let adjustedPanX = imageWidth / 2 - imageWidth / (2 * zoomScale) + panX / zoomScale;
    let adjustedPanY = imageHeight / 2 - imageHeight / (2 * zoomScale) + panY / zoomScale;

    stubsDraggable.current.style.transform = `scale(${zoomScale}) translate(${adjustedPanX}px, ${adjustedPanY}px)`;
  }, [zoomScale, panX, panY]);

  useEffect(() => {
    console.log("AlphaComponent - useEffect EventListeners 'keyup' & keydown' added")
    // from: https://stackoverflow.com/questions/59546928/keydown-up-events-with-react-hooks-not-working-properly
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "Shift") {
      setDragMode(true);
      evntLog && console.log("AlphaComponent.js handleKeyDown() Shift key pressed");
    }
    if (event.key === "Alt") {
      setAdminMode(true);
      evntLog && console.log("AlphaComponent.js handleKeyDown() Alt key pressed");
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === "Shift") {
      setDragMode(false);
      evntLog && console.log("AlphaComponent.js handleKeyUp() Shift key released");
    }
    if (event.key === "Alt") {
      setAdminMode(false);
      evntLog && console.log("AlphaComponent.js handleKeyUp() Alt key released");
    }

  };

  // Retrive from DB into postingsDataArray, so postingsDataArray is never null
  if (!postingsDataArray) {
    console.log("postingsDataArray is falsy so retrieving it from the DB. In the interim setting it to [emptyPost]");
    setPostingsDataArray([emptyPost]);
    retrievePosts(setPostingsDataArray, emptyPost);
  }

  // Retrive from DB into topicsDataArray, so topicsDataArray is never null
  if (!topicsDataArray) {
    console.log("topicsDataArray is falsy so retrieving it from the DB. In the interim setting it to [emptyTopic]");
    setTopicsDataArray([emptyTopic]);
    retrieveTopics(setTopicsDataArray, emptyTopic);
  }


  const createPostAtMouseClick = (event) => {
    // This function needs the event object, so may need currying to move to external file.
    console.log("createPostAtMouseClick stubDragged.current=", stubDragged.current, " and dragMode=",dragMode);
    
    if (dragMode && !stubDragged.current && !topicDragged.current) {
      const offsetX = event.pageX - window.pageXOffset; // - currentTargetRect.left;
      const offsetY = event.pageY - window.pageYOffset; // - currentTargetRect.top;
      posnLog && console.log("createPostAtMouseClick event.pageX=", event.pageX, "  window.pageXOffset=",window.pageXOffset);
      posnLog && console.log("createPostAtMouseClick event.pageY=", event.pageY, "  window.pageYOffset=",window.pageYOffset);

      console.log("AlphaComponent.js createPostAtMouseClick: creatingPostFlag=true");
      setCreatingPostFlag(true);
  
      const emptyPostWithCoords = { ...emptyPost, positionX: offsetX, positionY: offsetY };
      setPostDraft(emptyPostWithCoords);
      console.log("AlphaComponent.js createPostAtMouseClick: setting postDraft to", emptyPostWithCoords);
  
      setCurrPostIndex(() => {
        const newCurrPostIndex = postingsDataArray.length; // No need for .length-1 cos we just added an element
        console.log("AlphaComponent.js createPostAtMouseClick: newCurrPostIndex=", newCurrPostIndex);
        return newCurrPostIndex;
      });
      setShowMainModal(true);
    }
  };


  // MAIN AlphaComponent RETURN
  return (
    <div className="background" style={{width: `${imageWidth}px`, height: `${imageHeight}px`}}>
      
      <NavBar className="absolute"
        emptyPost={emptyPost}
        showWelcomeModal={showWelcomeModal}
        setShowWelcomeModal={setShowWelcomeModal}
        setShowMainModal={setShowMainModal}
        postingsDataArray={postingsDataArray}
        setPostingsDataArray={setPostingsDataArray}
        setCurrPostIndex={setCurrPostIndex}
        setCreatingPostFlag={setCreatingPostFlag}
        setPostDraft={setPostDraft}

        emptyTopic ={emptyTopic}
        setShowTopicModal ={setShowTopicModal}
        topicsDataArray ={topicsDataArray}
        setTopicsDataArray ={setTopicsDataArray}
        setCurrTopicIndex={setCurrTopicIndex}
        setCreatingTopicFlag={setCreatingTopicFlag}
        setTopicDraft={setTopicDraft}
        resetZoom={resetZoom}
        // recdLog={recdLog}
      />


      {/* Draggable Mode */}
      <div
        ref={stubsDraggable}
        onClick={(event) => createPostAtMouseClick(event)}
        className="backdrop absolute"
      >
        {dragMode && (
          <>
            <RenderStubsDraggable
              postingsDataArray={postingsDataArray}
              setCurrPostIndex={setCurrPostIndex}
              setShowMainModal={setShowMainModal}
              postDraft={postDraft}
              setPostDraft={setPostDraft}
              setCreatingPostFlag={setCreatingPostFlag}
              userVoted={userVoted}
              setUserVoted={setUserVoted}
              stubDragged={stubDragged}
              stubScale={stubScale}
              recdLog={recdLog}
              posnLog={posnLog}
            />
            <RenderTopicsDraggable
              topicsDataArray={topicsDataArray}
              setCurrTopicIndex={setCurrTopicIndex}
              setShowTopicModal={setShowTopicModal}
              setTopicDraft={setTopicDraft}
              setCreatingTopicFlag={setCreatingTopicFlag}
              topicDragged={topicDragged}
              stubScale={stubScale}
            />
          </>
        )}
      </div>


      {/* ZoomPan mode */}
      {!dragMode && (
        <ZoomPanNonDraggableStubs
          updateZoomPan={updateZoomPan}
          zoomScale={zoomScale}
          minZoomScale={minZoomScale}
          panX={panX}
          panY={panY}
          // zoomedOrPanned={zoomedOrPanned}

          postingsDataArray={postingsDataArray}
          currPostIndex={currPostIndex}
          setCurrPostIndex={setCurrPostIndex}
          showMainModal={showMainModal}
          setShowMainModal={setShowMainModal}
          postDraft={postDraft}
          setPostDraft={setPostDraft}
          setCreatingPostFlag={setCreatingPostFlag}
          userVoted={userVoted}
          setUserVoted={setUserVoted}

          emptyTopic={emptyTopic}
          setShowTopicModal={setShowTopicModal}
          topicsDataArray={topicsDataArray}
          setCurrTopicIndex={setCurrTopicIndex}
          setCreatingTopicFlag={setCreatingTopicFlag}
          setTopicDraft={setTopicDraft}
          stubScale={stubScale}

          posnLog={posnLog}
          recdLog={recdLog}
        />
      )}

      {/* Present for both DragMode and !DragMode, but often hidden */}
      {showMainModal && (
        <MainModal
          showMainModal={showMainModal}
          setShowMainModal={setShowMainModal}
          postingsDataArray={postingsDataArray}
          setPostingsDataArray={setPostingsDataArray}
          currPostIndex={currPostIndex} //C: currPostIndex points to the element in the postings array that we're interested in
          setCurrPostIndex={setCurrPostIndex}
          postDraft={postDraft}
          setPostDraft={setPostDraft}
          creatingPostFlag={creatingPostFlag}
          userVoted={userVoted}
          setUserVoted={setUserVoted}
          recdLog={recdLog}
        />
      )}

      {showTopicModal && (
        <TopicModal
          showTopicModal={showTopicModal}
          setShowTopicModal={setShowTopicModal}
          topicsDataArray={topicsDataArray}
          setTopicsDataArray={setTopicsDataArray}
          currTopicIndex={currTopicIndex} //C: currTopicIndex points to the element in the topics array that we're interested in
          setCurrTopicIndex={setCurrTopicIndex}
          topicDraft={topicDraft}
          setTopicDraft={setTopicDraft}
          creatingTopicFlag={creatingTopicFlag}
          recdLog={recdLog}
        />
      )}

      {dragMode && <div>Drag items to desired positions</div>}

      {adminMode &&
        <div className="flex flexrow items-center">
          <div className="text-xl mx-3 text-gray-700">Admin Controls:</div>

          <Button
            variant="outline-success"
            className="mx-2"
            onClick={() => {
              unlockAll(postingsDataArray, topicsDataArray);
              retrievePosts(setPostingsDataArray, emptyTopic); // Time for a hard-update
              retrieveTopics(setTopicsDataArray, emptyTopic); // Time for a hard-update
            }}>
            Unlock All
          </Button>

          <Button
            variant="outline-secondary"
            className="mx-2"
            onClick={() => unarchiveAllPosts(setPostingsDataArray, emptyPost)}
          >
            Unarchive All Posts
          </Button>

          <Button
            variant="outline-secondary"
            className="mx-2"
            onClick={() => unarchiveAllTopics(setTopicsDataArray, emptyTopic)}
          >
            Unarchive All Topics
          </Button>
        
          <Button
            variant="outline-danger"
            className="mx-2"
            onClick={() => {
              removeAllPosts();
              setPostingsDataArray([emptyPost]);
            }}>
            PERMANENTLY DELETE All Posts
          </Button>

          <Button
            variant="outline-danger"
            className="mx-2"
            onClick={() => {
              removeAllTopics();
              setTopicsDataArray([emptyTopic]);
            }}>
            PERMANENTLY DELETE All Topics
          </Button>
          
          <div className="mx-2">NB: No Warning Given - These Actions Take Immediate Effect</div>

        </div>
      }
    </div>
  );
};

export default AlphaComponent;

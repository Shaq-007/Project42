import React, { Component } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import RenderStubsNonDraggable from "./RenderStubsNonDraggable";
// import ZoomControls from "./ZoomControls";

class ZoomPanNonDraggableStubs extends Component {
  render() {
    const updateZoomPan = this.props.updateZoomPan;
    let zoomScale = this.props.zoomScale;
    let panX = this.props.panX;
    let panY = this.props.panY;
    let postingsDataArray = this.props.postingsDataArray;
    let currPostIndex = this.props.currPostIndex;
    const setCurrPostIndex = this.props.setCurrPostIndex;
    let showMainModal = this.props.showMainModal;
    const setShowMainModal = this.props.setShowMainModal;
    let postDraft = this.props.postDraft;
    const setPostDraft = this.props.setPostDraft;
    const setCreatingPostFlag = this.props.setCreatingPostFlag;
    let userVoted = this.props.userVoted;
    const setUserVoted = this.props.setUserVoted;


    return (
      <div>
        {/* className="relative" */}
        <TransformWrapper
          scale={zoomScale}
          positionX={panX}
          positionY={panY}
          onZoomChange={updateZoomPan}
          onPanning={updateZoomPan}
          onPanningStop={updateZoomPan}
          enablePadding={false}
          wheel={{
            step: 160,
          }}
          options={{
            // See "Options prop elements" on https://www.npmjs.com/package/react-draggable
            minScale: 0.5,
            maxScale: 15,
            centerContent: false,
            limitToBounds: false,
          }}>
          {() => (      // { zoomIn, zoomOut, setTransform }
            <>
              <TransformComponent>
                <div className="backdrop">
                  <RenderStubsNonDraggable
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
                  />
                </div>
              </TransformComponent>

              {/* <div className="absolute top-0 left-360">
                <ZoomControls
                  scale={zoomScale}
                  zoomIn={zoomIn}
                  zoomOut={zoomOut}
                  setTransform={setTransform}
                  panX={panX}
                  panY={panY}
                />
              </div> */}
            </>
          )}
        </TransformWrapper>
      </div>
    );
  }
}

export default ZoomPanNonDraggableStubs;
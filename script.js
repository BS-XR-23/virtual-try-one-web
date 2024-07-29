import VideoHandler from "./scripts/videoHandler.js";
import PoseLandmarkerManager from "./scripts/poseLandmarkerManager.js";
import DrawingUtils from "./scripts/drawingManager.js";
import ModelLoader from "./scripts/modelLoader.js";
import { VIDEO_ELEMENT_ID } from "./scripts/allConfig.js";

// Initialize instances
const canvasCtx = document.getElementById("output_canvas").getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);
modelLoader= new ModelLoader();
modelLoader.loadModel();
const poseLandmarkerManager = new PoseLandmarkerManager(
    document.getElementById(VIDEO_ELEMENT_ID),
    canvasCtx,
    drawingUtils,
    modelLoader
);

// Set the createPoseLandmarker method on window for global access
window.createPoseLandmarker = async () => {
    await poseLandmarkerManager.createPoseLandmarker();
};

// Make sure the predictWebcam method is accessible globally
window.predictWebcam = () => poseLandmarkerManager.predictWebcam();

// Optionally, initialize PoseLandmarkerManager if necessary
if (!window.poseLandmarker) {
    window.createPoseLandmarker();
}

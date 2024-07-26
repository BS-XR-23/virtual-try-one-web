import VideoHandler from "./videoHandler.js";
import PoseLandmarkerManager from "./poseLandmarkerManager.js";
import DrawingUtils from "./drawingManager.js";
import ModelLoader from "./modelLoader.js";

// Initialize instances
const videoHandler = new VideoHandler();

const gui = new lil.GUI();
gui.add(document, "title");

// Add a folder for webcam controls
const webcamFolder = gui.addFolder("Webcam");

// Video element
const videoElement = document.getElementById("webcam");

// Video control methods
const videoControls = {
    playVideo: function () {
        // a green color log message to indicate the method is called
        console.log("%c playVideo is called", "color: green");
        videoHandler.playVideo();
    },
    pauseVideo: function () {
        videoHandler.pauseVideo();
    },
    playWebcam: function () {
        videoElement.play();
    },
    pauseWebcam: function () {
        videoElement.pause();
    },
};

// Add controls to the GUI
webcamFolder.add(videoControls, "playVideo").name("Play Video");
webcamFolder.add(videoControls, "pauseVideo").name("Pause Video");
webcamFolder.add(videoControls, "playWebcam").name("Play Webcam");
webcamFolder.add(videoControls, "pauseWebcam").name("Pause Webcam");

webcamFolder.open();

import VideoHandler from "./videoHandler.js";
import PoseLandmarkerManager from "./poseLandmarkerManager.js";
import DrawingUtils from "./drawingManager.js";
import ModelLoader from "./modelLoader.js";

// Initialize instances
const videoHandler = new VideoHandler();


const gui = new lil.GUI();

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

// add a folder for model position controls
const modelPositionFolder = gui.addFolder("Model Position");

// Model control methods
const position = {
    x: 0,
    y: 0,
    z: 0,
};

// Function to update the model's position

let updateModelPosition = () => {
    // console.log("position", position);
    return () => {
        modelLoader.updateModelPosition(position);
    };
};

// Add controls to the GUI and listen for changes
modelPositionFolder.add(position, "x", -10, 10).onChange(updateModelPosition());
modelPositionFolder.add(position, "y", -10, 10).onChange(updateModelPosition());
modelPositionFolder.add(position, "z", -10, 10).onChange(updateModelPosition());




// add a folder for model position controls
const modelRotationFolder = gui.addFolder("Model Position");

// Model control methods
const rotation = {
    x: 0,
    y: 0,
    z: 0,
};

// Function to update the model's position

let updateModelRotation = () => {
    console.log("Rotation", rotation);
    return () => {
        modelLoader.updateModelRotation(rotation);
    };
};

// Add controls to the GUI and listen for changes
modelRotationFolder.add(rotation, "x", -10, 10).onChange(updateModelRotation());
modelRotationFolder.add(rotation, "y", -10, 10).onChange(updateModelRotation());
modelRotationFolder.add(rotation, "z", -10, 10).onChange(updateModelRotation());

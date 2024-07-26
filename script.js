// Import necessary components from MediaPipe and Skypack
import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";

// Define constants for desired resolution
const WIDTH = 1280;
const HEIGHT = 720;
let shirtModel = null;

// Initialize global variables
let poseLandmarker = undefined;
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const liveView = document.getElementById("liveView");

const canvasCtx = canvasElement.getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);

// load the model
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    // canvas: canvasElement2,
});
renderer.setSize(WIDTH, HEIGHT);
renderer.setAnimationLoop(animate);
liveView.appendChild(renderer.domElement);
// background color removed
renderer.setClearColor(0x000000, 0);

const loader = new GLTFLoader();

loader.load(
    "./assets/3DModel/shirt.glb",
    function (gltf) {
        shirtModel = gltf.scene;
        scene.add(shirtModel);
        shirtModel.scale.set(3, 3, 3);
        shirtModel.rotation.set(0, 0, 0);
    },
    function (xhr) {
        console.log(Math.floor((xhr.loaded / xhr.total) * 100) + "% loaded");
    },
    function (error) {
        console.error(error);
    }
);

camera.position.z = 5;

// ambient light
const light = new THREE.AmbientLight(0xffffff);
scene.add(light);
// shirtModel.scale.set(2, 2, 2);
function animate() {
    renderer.render(scene, camera);
}
// Function to set up the canvas dimensions

// Create and configure the PoseLandmarker instance
const createPoseLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `./assets/mediapipe-model/pose_landmarker_heavy.task`,
            delegate: "GPU",
        },
        runningMode: "VIDEO",
    });
};

// Setup canvas and video dimensions
const setupCanvasDimensions = () => {
    canvasElement.width = WIDTH;
    canvasElement.height = HEIGHT;

    video.width = WIDTH;
    video.height = HEIGHT;

    const container = document.getElementById("container");
    container.style.width = `${WIDTH}px`;
    container.style.height = `${HEIGHT}px`;
    document.getElementById("liveView").style.width = `${WIDTH}px`;
    document.getElementById("liveView").style.height = `${HEIGHT}px`;
};

// Handle window resize events
window.addEventListener("resize", setupCanvasDimensions);

// Start webcam feed
const startWebcam = () => {
    const constraints = {
        video: { width: WIDTH, height: HEIGHT },
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            setupCanvasDimensions();
            video.play();
        };
        video.addEventListener("loadeddata", predictWebcam);
    });
};

// Play a video file
const playVideo = () => {
    video.src = "./assets/videos/4.mp4"; // Set the path to your video file here
    video.onloadedmetadata = () => {
        setupCanvasDimensions();
        video.play();
        video.loop = true;
        video.muted = true;
    };
    video.addEventListener("loadeddata", predictWebcam);
};

// Add event listeners to buttons
document.getElementById("webcamButton").addEventListener("click", () => {
    if (!poseLandmarker) {
        createPoseLandmarker().then(startWebcam);
    } else {
        startWebcam();
    }
});

document.getElementById("videoButton").addEventListener("click", () => {
    if (!poseLandmarker) {
        createPoseLandmarker().then(playVideo);
    } else {
        playVideo();
    }
});

// Variables for landmark smoothing
let lastVideoTime = -1;
let prevLandmarks = null;
const smoothingFactor = 0.5; // Adjust this value for more or less smoothing

// Function to predict and draw pose landmarks
async function predictWebcam() {
    let startTimeMs = performance.now();

    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;

        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
            canvasCtx.save();
            canvasCtx.clearRect(
                0,
                0,
                canvasElement.width,
                canvasElement.height
            );

            if (result.landmarks && result.landmarks.length > 0) {
                const landmarks = result.landmarks[0];

                // Smooth landmarks
                if (prevLandmarks) {
                    for (let i = 0; i < landmarks.length; i++) {
                        landmarks[i].x =
                            smoothingFactor * prevLandmarks[i].x +
                            (1 - smoothingFactor) * landmarks[i].x;
                        landmarks[i].y =
                            smoothingFactor * prevLandmarks[i].y +
                            (1 - smoothingFactor) * landmarks[i].y;
                        landmarks[i].z =
                            smoothingFactor * prevLandmarks[i].z +
                            (1 - smoothingFactor) * landmarks[i].z;
                    }
                }

                prevLandmarks = landmarks;

                // Update the shirt model
                if (shirtModel) {
                    UpdateShirtModel(landmarks);
                }

                // Draw landmarks and connectors
                drawingUtils.drawLandmarks(landmarks, {
                    radius: (data) =>
                        DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
                });
                drawingUtils.drawConnectors(
                    landmarks,
                    PoseLandmarker.POSE_CONNECTIONS
                );
            }

            canvasCtx.restore();
        });
    }

    window.requestAnimationFrame(predictWebcam);
}

const UpdateShirtModel = (landmarks) => {
    // Ensure the model is loaded
    if (!shirtModel) return;

    // Define landmark indexes
    const leftShoulderIndex = 11;
    const rightShoulderIndex = 12;
    const leftHipIndex = 23;
    const rightHipIndex = 24;
    const leftElbowIndex = 13;
    const rightElbowIndex = 14;
    const wristLeftIndex = 15;
    const wristRightIndex = 16;

    // Define weights for each landmark pair
    const weightShoulder = 0.5;
    const weightHip = 0.3;
    const weightArm = 0.1; // Adjust weights as needed

    // Get landmarks
    const leftShoulder = landmarks[leftShoulderIndex];
    const rightShoulder = landmarks[rightShoulderIndex];
    const leftHip = landmarks[leftHipIndex];
    const rightHip = landmarks[rightHipIndex];
    const leftElbow = landmarks[leftElbowIndex];
    const rightElbow = landmarks[rightElbowIndex];
    const wristLeft = landmarks[wristLeftIndex];
    const wristRight = landmarks[wristRightIndex];

     // Calculate distances
  const shoulderDistance = Math.sqrt(
    Math.pow((rightShoulder.x - leftShoulder.x), 2) +
    Math.pow((rightShoulder.y - leftShoulder.y), 2) +
    Math.pow((rightShoulder.z - leftShoulder.z), 2)
  );

  const hipDistance = Math.sqrt(
    Math.pow((rightHip.x - leftHip.x), 2) +
    Math.pow((rightHip.y - leftHip.y), 2) +
    Math.pow((rightHip.z - leftHip.z), 2)
  );

  // Add wrist landmarks if available
  let wristDistance = 0;
  if (landmarks[wristLeft] && landmarks[wristRight]) {
    wristDistance = Math.sqrt(
      Math.pow((landmarks[wristRight].x - landmarks[wristLeft].x), 2) +
      Math.pow((landmarks[wristRight].y - landmarks[wristLeft].y), 2) +
      Math.pow((landmarks[wristRight].z - landmarks[wristLeft].z), 2)
    );
  }

  // Calculate a weighted average distance
  const avgDistance = (shoulderDistance * weightShoulder) + (hipDistance * weightHip) + (wristDistance * weightArm);

  // Apply a scale factor based on the average distance
  const scaleFactor = avgDistance * 25; // You might need to adjust this value

  // Set the scale of the shirt model
  shirtModel.scale.set(scaleFactor, scaleFactor, scaleFactor);
};

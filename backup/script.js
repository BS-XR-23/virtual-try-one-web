import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";

let poseLandmarker = undefined;
let shirtModel = null;
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

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasElement2 = document.getElementById("output_canvas2");
const canvasCtx = canvasElement.getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);

// three js code
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({
    alpha: true,
    // canvas: canvasElement2,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);
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

canvasElement2.style.width="1280px"
canvasElement2.style.height="720px"
// end of three js code

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

const startWebcam = () => {
    const constraints = {
        video: true,
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            setupCanvasDimensions();
        };
        video.addEventListener("loadeddata", predictWebcam);
    });
};

const playVideo = () => {
    video.src = "./assets/videos/1.mp4"; // Set the path to your video file here
    video.onloadedmetadata = () => {
        video.play();
        video.loop = true;
        setupCanvasDimensions();
    };
    video.addEventListener("loadeddata", predictWebcam);
};

const setupCanvasDimensions = () => {
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    document.getElementById("container").style.width = `${video.videoWidth}px`;
    document.getElementById(
        "container"
    ).style.height = `${video.videoHeight}px`;
};

let lastVideoTime = -1;
let prevLandmarks = null;
const smoothingFactor = 0.5; // Adjust this value for more or less smoothing

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
                // Draw the T-shirt on the canvas
                drawTShirt(landmarks);

                // Update 3D model position and orientation
                // updateShirtModel(landmarks);

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

const tshirtImage = new Image();
tshirtImage.src =
    "https://i.pinimg.com/originals/f7/1c/5c/f71c5c1e89dbb27a7e840b6fb60932eb.png";

const drawTShirt = (landmarks) => {
    // Assuming landmarks[11] and landmarks[12] are the left and right shoulders
    // Assuming landmarks[23] and landmarks[24] are the left and right hips
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Calculate the center point between the shoulders
    const centerX =
        ((leftShoulder.x + rightShoulder.x) / 2) * canvasElement.width;
    const centerY =
        ((leftShoulder.y + rightShoulder.y) / 2) * canvasElement.height;

    // Calculate the T-shirt width and height
    const tshirtWidth =
        Math.abs(rightShoulder.x - leftShoulder.x) * canvasElement.width * 1.9; // Adjust scale as needed
    const tshirtHeight =
        Math.abs(leftHip.y - leftShoulder.y) * canvasElement.height * 1.5; // Adjust scale as needed

    /// Adjust T-shirt position dynamically
    const shoulderToHipDist =
        Math.abs(leftHip.y - leftShoulder.y) * canvasElement.height;
    const dynamicYOffset = shoulderToHipDist * 0.25; // Adjust this multiplier as needed for better positioning

    const tshirtX = centerX - tshirtWidth / 2;
    const tshirtY = leftShoulder.y * canvasElement.height - dynamicYOffset;

    canvasCtx.drawImage(
        tshirtImage,
        tshirtX,
        tshirtY,
        tshirtWidth,
        tshirtHeight
    );
};

const updateShirtModel = (landmarks) => {
    if (!shirtModel) return;

    console.log("Updating shirt model...");
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Calculate the center points between shoulders and hips
    const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
    const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;

    // Average Z position (for depth)
    const shoulderCenterZ = (leftShoulder.z + rightShoulder.z) / 2;

    // Calculate the distance between shoulders for scaling
    const shoulderWidth = Math.sqrt(
        Math.pow(rightShoulder.x - leftShoulder.x, 2) +
        Math.pow(rightShoulder.y - leftShoulder.y, 2)
    );

    // Adjust model scale based on shoulder width
    const modelScale = shoulderWidth * 10; // Adjust scale factor based on testing

    // Set the position of the model
    const shirtPositionX = shoulderCenterX * canvasElement.width-670;
    const shirtPositionY = -shoulderCenterY * canvasElement.height +500; // Adjust offset if needed
    const shirtPositionZ = shoulderCenterZ; // Adjust depth scaling

    shirtModel.position.set(
        shirtPositionX,
        shirtPositionY,
        shirtPositionZ
    );

    // Set the scale of the model
    shirtModel.scale.set(modelScale, modelScale, modelScale);

    // Calculate the angle between the shoulders for rotation
    const angle = Math.atan2(
        rightShoulder.y - leftShoulder.y,
        rightShoulder.x - leftShoulder.x
    );

    // Set the rotation of the model
    shirtModel.rotation.set(0, 0, angle); // Adjust rotation if needed

    console.log(`Position: (${shirtModel.position.x}, ${shirtModel.position.y}, ${shirtModel.position.z})`);
    console.log(`Scale: ${modelScale}`);
    console.log(`Rotation: ${angle}`);
};

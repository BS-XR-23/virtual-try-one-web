import {
    PoseLandmarker,
    FilesetResolver,
    DrawingUtils,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

let poseLandmarker = undefined;

const createPoseLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `./mediapipe-model/pose_landmarker_heavy.task`,
            delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 2,
        minPoseDetectionConfidence: 0.8,
        minPosePresenceConfidence: 0.8,
        minTrackingConfidence: 0.8,
        outputSegmentationMasks: true,
    });
};

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);

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
    video.src = "./1.mp4"; // Set the path to your video file here
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

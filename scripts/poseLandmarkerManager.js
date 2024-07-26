import { SMOOTHING_FACTOR, MODEL_PATH } from "./allConfig.js";
import {
    PoseLandmarker,
    FilesetResolver,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

export default class PoseLandmarkerManager {
    constructor(videoElement, canvasCtx, drawingUtils) {
        this.video = videoElement;
        this.canvasCtx = canvasCtx;
        this.drawingUtils = drawingUtils;
        this.poseLandmarker = null;
        this.prevLandmarks = null;
        this.smoothingFactor = SMOOTHING_FACTOR;
        this.lastVideoTime = -1; // Initialize lastVideoTime as a class property

        this.predictWebcam = this.predictWebcam.bind(this); // Bind predictWebcam
    }

    async createPoseLandmarker() {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: MODEL_PATH,
                delegate: "GPU",
            },
            runningMode: "VIDEO",
        });
        window.poseLandmarker = this.poseLandmarker;
    }

    predictWebcam() {
        let startTimeMs = performance.now();

        if (this.lastVideoTime !== this.video.currentTime) {
            this.lastVideoTime = this.video.currentTime;

            this.poseLandmarker.detectForVideo(
                this.video,
                startTimeMs,
                (result) => {
                    this.canvasCtx.save();
                    this.canvasCtx.clearRect(
                        0,
                        0,
                        this.canvasCtx.canvas.width,
                        this.canvasCtx.canvas.height
                    );

                    if (result.landmarks && result.landmarks.length > 0) {
                        const landmarks = result.landmarks[0];

                        if (this.prevLandmarks) {
                            for (let i = 0; i < landmarks.length; i++) {
                                landmarks[i].x =
                                    this.smoothingFactor *
                                        this.prevLandmarks[i].x +
                                    (1 - this.smoothingFactor) * landmarks[i].x;
                                landmarks[i].y =
                                    this.smoothingFactor *
                                        this.prevLandmarks[i].y +
                                    (1 - this.smoothingFactor) * landmarks[i].y;
                                landmarks[i].z =
                                    this.smoothingFactor *
                                        this.prevLandmarks[i].z +
                                    (1 - this.smoothingFactor) * landmarks[i].z;
                            }
                        }

                        this.prevLandmarks = landmarks;

                        this.drawingUtils.drawLandmarks(landmarks);
                        this.drawingUtils.drawConnectors(landmarks);
                    }

                    this.canvasCtx.restore();
                }
            );
        }

        window.requestAnimationFrame(this.predictWebcam);
    }
}

import {
    DrawingUtils,
    PoseLandmarker,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

export default class DrawingManager {
    constructor(canvasCtx) {
        this.drawingUtils = new DrawingUtils(canvasCtx);
        this.options = {
            radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
        };
    }

    drawLandmarks(landmarks) {
        const updatedLandmarks = this.drawCustomLandmarks(landmarks);
        this.drawingUtils.drawLandmarks(updatedLandmarks, this.options);
    }

    drawConnectors(landmarks) {
        this.drawingUtils.drawConnectors(
            landmarks,
            PoseLandmarker.POSE_CONNECTIONS
        );
    }

    // draw a extra landmark on the canvas in hip center
    drawCustomLandmarks(landmarks) {
        const updatedLandmarks = landmarks;

        const hipCenter = {
            x: (landmarks[23].x + landmarks[24].x) / 2,
            y: (landmarks[23].y + landmarks[24].y) / 2,
            z: (landmarks[23].z + landmarks[24].z) / 2,
        };
        updatedLandmarks.push(hipCenter);
        return updatedLandmarks;
    }
}

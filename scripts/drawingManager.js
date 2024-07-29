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

        // Calculate the body center, 11, 12, 23, 24 are the hip landmarks

        const bodyCenter = {
            x: (landmarks[11].x + landmarks[12].x + landmarks[23].x + landmarks[24].x) / 4,
            y: (landmarks[11].y + landmarks[12].y + landmarks[23].y + landmarks[24].y) / 4,
            z: (landmarks[11].z + landmarks[12].z + landmarks[23].z + landmarks[24].z) / 4,
        };

        updatedLandmarks.push(bodyCenter);
        modelLoader.updateModel(updatedLandmarks);
        return updatedLandmarks;
    }
}

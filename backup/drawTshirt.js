// drawTShirt.js

export default class TShirtDrawer {
    constructor(tshirtImageUrl) {
        this.tshirtImage = new Image();
        this.tshirtImage.src = tshirtImageUrl;
    }

    draw(landmarks, canvasCtx, canvasElement) {
        // Assuming landmarks[11] and landmarks[12] are the left and right shoulders
        // Assuming landmarks[23] and landmarks[24] are the left and right hips
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftHip = landmarks[23];

        // Calculate the center point between the shoulders
        const centerX = ((leftShoulder.x + rightShoulder.x) / 2) * canvasElement.width;

        // Calculate the T-shirt width and height
        const tshirtWidth = Math.abs(rightShoulder.x - leftShoulder.x) * canvasElement.width * 1.9; // Adjust scale as needed
        const tshirtHeight = Math.abs(leftHip.y - leftShoulder.y) * canvasElement.height * 1.5; // Adjust scale as needed

        /// Adjust T-shirt position dynamically
        const shoulderToHipDist = Math.abs(leftHip.y - leftShoulder.y) * canvasElement.height;
        const dynamicYOffset = shoulderToHipDist * 0.25; // Adjust this multiplier as needed for better positioning

        const tshirtX = centerX - tshirtWidth / 2;
        const tshirtY = leftShoulder.y * canvasElement.height - dynamicYOffset;

        canvasCtx.drawImage(
            this.tshirtImage,
            tshirtX,
            tshirtY,
            tshirtWidth,
            tshirtHeight
        );
    }
}

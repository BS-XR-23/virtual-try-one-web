// videoUtils.js

export default class VideoUtils {
    constructor(
        poseLandmarker,
        video,
        setupCanvasDimensions,
        predictWebcam,
        canvasCtx,
        canvasElement,
        drawingUtils,
        createPoseLandmarker
    ) {
        this.poseLandmarker = poseLandmarker;
        this.video = video;
        this.setupCanvasDimensions = setupCanvasDimensions;
        this.predictWebcam = predictWebcam;
        this.canvasCtx = canvasCtx;
        this.canvasElement = canvasElement;
        this.drawingUtils = drawingUtils;
        this.createPoseLandmarker = createPoseLandmarker;

        this.initEventListeners();
    }

    initEventListeners() {
        document.getElementById("webcamButton").addEventListener("click", () => {
            if (!this.poseLandmarker) {
                this.createPoseLandmarker().then(() => this.startWebcam());
            } else {
                this.startWebcam();
            }
        });

        document.getElementById("videoButton").addEventListener("click", () => {
            if (!this.poseLandmarker) {
                this.createPoseLandmarker().then(() => this.playVideo("../assets/videos/4.mp4"));
            } else {
                this.playVideo("../assets/videos/4.mp4");
            }
        });
    }

    startWebcam() {
        const constraints = {
            video: true,
        };

        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            this.video.srcObject = stream;
            this.video.onloadedmetadata = () => {
                this.video.play();
                this.setupCanvasDimensions();
            };
            this.video.addEventListener("loadeddata", () => this.predictWebcam(this.video, this.canvasCtx, this.canvasElement, this.drawingUtils));
        });
    }

    playVideo(videoPath) {
        this.video.src = videoPath;
        this.video.onloadedmetadata = () => {
            this.video.play();
            this.video.loop = true;
            this.setupCanvasDimensions();
        };
        this.video.addEventListener("loadeddata", () => this.predictWebcam(this.video, this.canvasCtx, this.canvasElement, this.drawingUtils));
    }
}

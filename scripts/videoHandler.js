import {
    WIDTH,
    HEIGHT,
    VIDEO_SRC,
    CANVAS_ID,
    LIVE_VIEW_ID,
    VIDEO_ELEMENT_ID,
} from "./allConfig.js";

export default class VideoHandler {
    constructor() {
        this.video = document.getElementById(VIDEO_ELEMENT_ID);
        this.canvasElement = document.getElementById(CANVAS_ID);
        this.liveView = document.getElementById(LIVE_VIEW_ID);
        
        
        this.canvasCtx = this.canvasElement.getContext("2d");

        this.WIDTH = WIDTH;
        this.HEIGHT = HEIGHT;

        this.setupCanvasDimensions();
        this.addEventListeners();
    }

    setupCanvasDimensions() {
        this.canvasElement.width = this.WIDTH;
        this.canvasElement.height = this.HEIGHT;

        this.video.width = this.WIDTH;
        this.video.height = this.HEIGHT;
        console.log("width", this.WIDTH);
        console.log("height", this.HEIGHT);

        const container = document.getElementById("container");
        container.style.width = `${WIDTH}px`;
        container.style.height = `${HEIGHT}px`;
        // Adjust the liveView container dimensions if needed
        this.liveView.style.width = `${this.WIDTH}px`;
        this.liveView.style.height = `${this.HEIGHT}px`;
    }

    startWebcam() {
        const constraints = {
            video: { width: this.WIDTH, height: this.HEIGHT },
        };

        this.checkIfPoseLandmarkerAvailable(() => {
            navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                this.video.srcObject = stream;
                this.video.onloadedmetadata = () => {
                    this.setupCanvasDimensions();
                    this.video.play();
                };
                this.video.addEventListener("loadeddata", window.predictWebcam);
            });
        });
    }

    playVideo() {
        this.checkIfPoseLandmarkerAvailable(() => {
            console.log("play video");
            this.video.src = VIDEO_SRC;
            this.video.onloadedmetadata = () => {
                this.setupCanvasDimensions();
                this.video.play();
                this.video.loop = true;
                this.video.muted = true;
            };
            this.video.addEventListener("loadeddata", window.predictWebcam);
        });
        // console.log("play video");
    }
    pauseVideo() {
        this.video.pause();
    }

    checkIfPoseLandmarkerAvailable(play) {
        if (!window.poseLandmarker) {
            window.createPoseLandmarker().then(() => play());
        } else {
            play();
        }
    }

    addEventListeners() {
        window.addEventListener("resize", () => this.setupCanvasDimensions());
    }
}

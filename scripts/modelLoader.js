import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { WIDTH, HEIGHT, SHIRT_MODEL_PATH, LIVE_VIEW_ID } from "./allConfig.js";

export default class ModelLoader {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            WIDTH / HEIGHT,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(WIDTH, HEIGHT);
        this.renderer.setAnimationLoop(this.animate.bind(this));
        this.renderer.setClearColor(0x000000, 0);
        document
            .getElementById(LIVE_VIEW_ID)
            .appendChild(this.renderer.domElement);
        this.camera.position.z = 5;
        this.shirtModelPath = SHIRT_MODEL_PATH;
        const light = new THREE.AmbientLight(0xffffff);
        this.scene.add(light);
        this.shirtModel = null;
        this.shirtMiddle = null;
    }

    loadModel() {
        console.log("this.shirtModelPath", this.shirtModelPath);

        const loader = new GLTFLoader();
        loader.load(
            this.shirtModelPath,
            (gltf) => {
                this.shirtModel = gltf.scene;

                this.shirtModel.scale.set(3, 3, 3);
                this.shirtModel.rotation.set(0, 0, 0);
                this.scene.add(this.shirtModel);
                // get the shirt element by object name

                this.shirtMiddle =
                    this.shirtModel.getObjectByName("mixamorig1Hips");
            },
            (xhr) => {
                console.log(
                    Math.floor((xhr.loaded / xhr.total) * 100) + "% loaded"
                );
            },
            (error) => {
                console.error(error);
            }
        );
    }

    animate() {
        this.renderer.render(this.scene, this.camera);
    }

    updateModelPosition(position) {
        if (this.shirtMiddle) {
            this.shirtMiddle.position.set(position.x, position.y, position.z);
        }
    }

    updateModelRotation(rotation) {
        if (this.shirtMiddle) {
            this.shirtMiddle.rotation.set(rotation.x, rotation.y, rotation.z);
        }
    }

    updateModel(landmarks) {
        if (!this.shirtMiddle) return;
        // last landmark is the hip center
        const hipCenter = landmarks[landmarks.length - 1];
        console.log("hipCenter", hipCenter);

        const { x, y } = this.getModelPosition(hipCenter);

        // Update model position
        this.updateModelPosition({ x, y, z: 0 });
        console.log('model position', { x, y, z: 0 });
        

        // Update model scaling
        const scalingFactor = this.getScalingFactor(landmarks);
        this.shirtModel.scale.set(scalingFactor, scalingFactor, scalingFactor);
    }

    getModelPosition(hipCenter) {
        const videoX = hipCenter.x;
        const videoY = hipCenter.y;
        const videoPositions = [
            { x: 0.3987945711638808, y: 0.5348200025552332 },
            { x: 0.5309684502336924, y: 0.6880486344089233 },
        ];
        const modelPositions = [
            { x: 0.48, y: -0.12 },
            { x: -0.15, y: -0.43 },
        ];

        const tX =
            (videoX - videoPositions[0].x) /
            (videoPositions[1].x - videoPositions[0].x);
        const tY =
            (videoY - videoPositions[0].y) /
            (videoPositions[1].y - videoPositions[0].y);

        const modelX =
            modelPositions[0].x +
            tX * (modelPositions[1].x - modelPositions[0].x);
        const modelY =
            modelPositions[0].y +
            tY * (modelPositions[1].y - modelPositions[0].y);

        return { x: modelX, y: modelY };
    }
    getScalingFactor(poseLandmarks) {
        // Landmarks
        const leftShoulder = poseLandmarks[11];
        const rightShoulder = poseLandmarks[12];
        const leftHip = poseLandmarks[23];
        const rightHip = poseLandmarks[24];
    
        // Calculate distances
        const shoulderWidth = this.calculateDistance(leftShoulder, rightShoulder);
        const hipWidth = this.calculateDistance(leftHip, rightHip);
    
        // Average width
        const averageWidth = (shoulderWidth + hipWidth) / 2;
    
        // Define a base width and calculate the scaling factor
        const baseWidth = .1; // Adjust based on your model's default width
        const scalingFactor = averageWidth / baseWidth;
    
        return scalingFactor*5;
    }
    calculateDistance(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

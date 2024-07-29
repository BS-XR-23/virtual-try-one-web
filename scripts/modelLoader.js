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
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load(
            this.shirtModelPath,
            (gltf) => {
                this.shirtModel = gltf.scene;

                this.shirtModel.scale.set(1,1,1);
                this.shirtModel.rotation.set(0, 0, 0);
                this.scene.add(this.shirtModel);
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
        if (this.shirtModel) {
            this.shirtModel.position.set(position.x, position.y, position.z);
        }
    }

    updateModelRotation(rotation) {
        if (this.shirtModel) {
            this.shirtModel.rotation.set(rotation.x, rotation.y, rotation.z);
        }
    }

    updateModel(landmarks) {
        if (!this.shirtModel) return;
    
        // Assuming landmarks[11] and landmarks[12] are the left and right shoulders
        // Assuming landmarks[23] and landmarks[24] are the left and right hips
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const leftHip = landmarks[23];
    
        // Calculate the center point between the shoulders
        const centerX = (leftShoulder.x + rightShoulder.x) / 2;
        const centerY = (leftShoulder.y + rightShoulder.y) / 2;
    
        // Calculate the T-shirt width and height
        const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
        const torsoHeight = Math.abs(leftHip.y - leftShoulder.y);
        const tshirtWidth = shoulderWidth * 11.9; // Adjust scale as needed
        const tshirtHeight = torsoHeight * 11.5; // Adjust scale as needed
    
        // Adjust T-shirt position dynamically
        const dynamicYOffset = torsoHeight * 0.25; // Adjust this multiplier as needed for better positioning
    
        const tshirtX = centerX * WIDTH;
        const tshirtY = (centerY - dynamicYOffset) * HEIGHT;
        const tshirtZ = 0; // Assuming z is 0 for simplicity, adjust as needed
    
        // Update model position and scale
        this.updateModelPosition({ x: tshirtX, y: -tshirtY, z: tshirtZ });
        this.shirtModel.scale.set(tshirtWidth, tshirtHeight, tshirtWidth);
    }
    
}

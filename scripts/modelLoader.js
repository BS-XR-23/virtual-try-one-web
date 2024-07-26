import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { WIDTH, HEIGHT, SHIRT_MODEL_PATH, LIVE_VIEW_ID } from "./allConfig.js";

export default class ModelLoader {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, WIDTH/HEIGHT, 0.1, 1000);
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

        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load(
            this.shirtModelPath,
            (gltf) => {
                this.shirtModel = gltf.scene;
                this.shirtModel.scale.set(3, 3, 3);
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
       if (this.shirtModel) {
            this.shirtModel.rotation.y += 0.01;
        
       }
        
    }
}

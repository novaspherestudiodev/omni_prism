import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export class PostProcessing {
    constructor(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.composer = null;
        this.bloomPass = null; // <--- Store it here

        this.init();
    }

    init() {
        this.composer = new EffectComposer(this.renderer);

        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // We save this to 'this.bloomPass' so we can animate 'this.bloomPass.strength' later
        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, 
            0.4, 
            0.85 
        );

        this.composer.addPass(this.bloomPass);
    }

    resize(width, height) {
        this.composer.setSize(width, height);
    }

    render() {
        this.composer.render();
    }
}

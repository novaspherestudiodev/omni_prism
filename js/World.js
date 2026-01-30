import * as THREE from 'three';
import { Environment } from './objects/Environment.js';
import { Prism } from './objects/Prism.js';
import { PostProcessing } from './post/PostProcessing.js';
import gsap from 'gsap'; // <--- NEW IMPORT

export class World {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000); 

        this.camera = null;
        this.renderer = null;
        this.environment = null;
        this.prism = null;
        this.postProcessing = null;
        this.time = 0;
        
        // Flag to stop mouse movement during the warp
        this.isWarping = false;

        this.mouse = new THREE.Vector2();
        this.targetMouse = new THREE.Vector2();

        this.init();
    }

    init() {
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
        this.camera.position.z = 7;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: false,
            powerPreference: "high-performance",
            stencil: false,
            depth: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        this.environment = new Environment(this.renderer);
        this.prism = new Prism(this.scene, this.environment.texture);
        this.postProcessing = new PostProcessing(this.scene, this.camera, this.renderer);

        this.render();
    }

    // --- NEW: THE WARP SEQUENCE ---
    triggerWarp() {
        this.isWarping = true;

        // 1. DATA EXPLOSION (Chromatic Aberration)
        // We stretch the rainbow effect until the object looks like pure energy
        if(this.prism && this.prism.mesh) {
            gsap.to(this.prism.mesh.material.uniforms.uChromaticAberration, {
                value: 4.0, // Extreme splitting
                duration: 2,
                ease: "power2.in"
            });
            
            // Spin the object violently
            gsap.to(this.prism.mesh.rotation, {
                z: "+=10", // Rotate 10 radians
                duration: 3,
                ease: "power2.in"
            });
        }

        // 2. LIGHT FLASH (Bloom)
        // Blind the user temporarily
        if(this.postProcessing) {
            gsap.to(this.postProcessing.bloomPass, {
                strength: 10, // Massive glow
                radius: 1,
                duration: 2,
                ease: "expo.in"
            });
        }

        // 3. ENTER THE PORTAL (Camera Zoom)
        // Fly through the crystal
        gsap.to(this.camera.position, {
            z: 0.5, // Stop right inside the glass
            duration: 2.5,
            ease: "expo.in",
            onComplete: () => {
                // Optional: Redirect or show next section here
                console.log("Welcome to the Portfolio.");
            }
        });
    }

    onMouseMove(mouse) {
        // Disable mouse look during the warp sequence
        if(this.isWarping) return;
        
        this.targetMouse.x = mouse.x;
        this.targetMouse.y = mouse.y;
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
        if(this.postProcessing) this.postProcessing.resize(this.width, this.height);
    }

    render() {
        this.time += 0.01;

        if(this.environment) this.environment.update(this.time);
        
        // Pass mouse data to prism for tilt (only if not warping)
        if(this.prism && !this.isWarping) {
            this.prism.update(this.time, this.mouse);
        } else if (this.prism && this.isWarping) {
            // During warp, just update time
            this.prism.mesh.material.uniforms.uTime.value = this.time;
        }

        // Camera Logic
        if(!this.isWarping) {
            this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
            this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
            this.camera.position.x = this.mouse.x * 2;
            this.camera.position.y = this.mouse.y * 2;
            this.camera.lookAt(0, 0, 0);
        }

        if(this.postProcessing) {
            this.postProcessing.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
        
        requestAnimationFrame(this.render.bind(this));
    }
}


import * as THREE from 'three';

export class Environment {
    constructor(renderer) {
        this.renderer = renderer;
        this.bgScene = new THREE.Scene();
        
        // 1. Render Target (The texture container)
        this.renderTarget = new THREE.WebGLCubeRenderTarget(512, { // Increased resolution
            type: THREE.HalfFloatType,
            format: THREE.RGBAFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter
        });
        
        // 2. The Cube Camera (The "Eye" inside the prism)
        this.cubeCamera = new THREE.CubeCamera(0.1, 100, this.renderTarget);

        this.initLights();
    }

    initLights() {
        // Light A: The Hot Pink Ring
        const ringGeo = new THREE.TorusGeometry(10, 1, 16, 100); // Thicker ring
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
        this.ring = new THREE.Mesh(ringGeo, ringMat);
        this.bgScene.add(this.ring);

        // Light B: The Cyan Strips
        const boxGeo = new THREE.BoxGeometry(2, 50, 2); // Thicker bars
        const boxMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });

        this.lights = [];
        for(let i = 0; i < 6; i++) {
            const mesh = new THREE.Mesh(boxGeo, boxMat);
            const angle = (i / 6) * Math.PI * 2;
            const radius = 15;
            
            mesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
            mesh.lookAt(0,0,0);
            
            this.lights.push(mesh);
            this.bgScene.add(mesh);
        }
    }

    get texture() {
        return this.renderTarget.texture;
    }

    update(time) {
        // Rotate the ring
        if(this.ring) {
            this.ring.rotation.x = Math.sin(time * 0.5) * 0.5;
            this.ring.rotation.y = time * 0.2;
        }

        // Move the lights
        this.lights.forEach((mesh, i) => {
            mesh.position.y = Math.sin(time + i) * 5;
        });

        // Capture the snapshot
        this.cubeCamera.update(this.renderer, this.bgScene);
    }
}
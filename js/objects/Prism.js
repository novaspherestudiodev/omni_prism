import * as THREE from 'three';

export class Prism {
    constructor(scene, envTexture) {
        this.scene = scene;
        this.envTexture = envTexture;
        this.mesh = null;
        
        this.init();
    }

    init() {
        // --- 1. THE GEOMETRY: TRUE PRISM ---
        // IcosahedronGeometry(radius, detail)
        // detail = 0 gives us a raw, 20-sided crystal.
        // This looks much more "Advanced Tech" than the previous knot.
        const geometry = new THREE.IcosahedronGeometry(2, 0);

        // --- 2. THE SHADER (The Brains) ---
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                envMap: { value: this.envTexture },
                uChromaticAberration: { value: 0.05 }, // Increased slightly for sharp edges
                uRefractPower: { value: 1.0 }, 
                uFresnelBias: { value: 0.1 },
                uFresnelScale: { value: 2.0 },
                uFresnelPower: { value: 1.5 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                varying vec3 vNormal;
                varying vec3 vViewPosition;

                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    
                    // Standard Normal calculation
                    vNormal = normalize(mat3(modelMatrix) * normal);
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform samplerCube envMap;
                uniform float uChromaticAberration;
                
                varying vec3 vWorldPosition;
                varying vec3 vNormal;

                void main() {
                    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
                    vec3 normal = normalize(vNormal);

                    // --- SHARP FRESNEL FOR FLAT FACES ---
                    float fresnelFactor = dot(viewDirection, normal);
                    fresnelFactor = clamp(1.0 - fresnelFactor, 0.0, 1.0);
                    fresnelFactor = pow(fresnelFactor, 3.0); 

                    // --- DISPERSION ---
                    float ior = 1.45;
                    vec3 refractR = refract(-viewDirection, normal, 1.0 / ior);
                    vec3 refractG = refract(-viewDirection, normal, 1.0 / (ior + uChromaticAberration));
                    vec3 refractB = refract(-viewDirection, normal, 1.0 / (ior + uChromaticAberration * 2.0));

                    vec4 colorR = textureCube(envMap, refractR);
                    vec4 colorG = textureCube(envMap, refractG);
                    vec4 colorB = textureCube(envMap, refractB);

                    vec3 refractionColor = vec3(colorR.r, colorG.g, colorB.b);
                    refractionColor *= 3.0; // High intensity for the flat faces

                    vec3 reflectDir = reflect(-viewDirection, normal);
                    vec3 reflectionColor = textureCube(envMap, reflectDir).rgb;

                    vec3 finalColor = mix(refractionColor, reflectionColor, fresnelFactor);

                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    update(time, mouse) {
        if(!this.mesh) return;

        // Update Uniforms
        this.mesh.material.uniforms.uTime.value = time;

        // --- ROBOTIC ROTATION ---
        // Instead of a smooth spin, we give it a slow, heavy tumble
        // This makes it feel like a massive floating artifact
        this.mesh.rotation.x = Math.sin(time * 0.1) * 0.2;
        this.mesh.rotation.y += 0.002;

        // Interaction (Tilt)
        this.mesh.rotation.x += mouse.y * 0.05;
        this.mesh.rotation.z -= mouse.x * 0.05;
    }
}

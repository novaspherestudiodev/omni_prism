import { World } from './World.js';
import gsap from 'gsap';

console.log("💎 OMNI SYSTEM: Initializing...");

document.addEventListener('DOMContentLoaded', () => {
    
    const canvas = document.querySelector('#gl');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorCircle = document.querySelector('.cursor-circle');
    
    // THE TRIGGER BUTTON
    const initBtn = document.querySelector('#init-audio'); 

    if(!canvas || !initBtn) {
        console.error("❌ CRITICAL: Missing DOM elements.");
        return;
    }

    const world = new World(canvas);
    console.log("✅ 3D World Attached");

    // --- INTERACTION EVENT: WARP SPEED ---
    initBtn.addEventListener('click', () => {
        // 1. Play Sound (Optional - add audio file later)
        // const audio = new Audio('warp.mp3');
        // audio.play();

        // 2. Animate UI Out
        // We use GSAP to explode the text letters or just fade
        gsap.to(".ui-layer", {
            opacity: 0,
            scale: 1.1, // Slight expansion
            filter: "blur(10px)", // Cinematic blur out
            duration: 1.5,
            ease: "power2.in",
            pointerEvents: "none"
        });

        // 3. Trigger 3D Warp
        world.triggerWarp();
    });

    // --- CURSOR LOGIC ---
    const mouse = { x: 0, y: 0 }; 

    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        gsap.to(cursorDot, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: 'power2.out'
        });

        gsap.to(cursorCircle, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.5,
            ease: 'power2.out'
        });
        
        world.onMouseMove(mouse);
    });

    // Hover Effects
    const buttons = document.querySelectorAll('button, a');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(cursorCircle, { scale: 2, duration: 0.3 });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(cursorCircle, { scale: 1, duration: 0.3 });
        });
    });

    window.addEventListener('resize', () => {
        world.onResize();
    });
});

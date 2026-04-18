import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let planets = [];
let raycaster, mouse;

const planetData = {
    sun: {
        name: '太阳',
        description: '太阳系的中心天体，一颗黄矮星',
        details: '质量：约2×10³⁰千克 | 温度：表面约5500°C',
        color: 0xffdd00,
        size: 3,
        orbitRadius: 0,
        orbitSpeed: 0,
        rotationSpeed: 0.002
    },
    mercury: {
        name: '水星',
        description: '太阳系中最小且距离太阳最近的行星',
        details: '公转周期：88天 | 温度：-173°C 至 427°C',
        color: 0xaaaaaa,
        size: 0.4,
        orbitRadius: 6,
        orbitSpeed: 0.04,
        rotationSpeed: 0.004
    },
    venus: {
        name: '金星',
        description: '太阳系中最热的行星',
        details: '公转周期：225天 | 温度：约462°C',
        color: 0xffcc88,
        size: 0.9,
        orbitRadius: 9,
        orbitSpeed: 0.03,
        rotationSpeed: 0.003
    },
    earth: {
        name: '地球',
        description: '我们的家园，唯一已知存在生命的星球',
        details: '公转周期：365天 | 温度：平均15°C',
        color: 0x4488ff,
        size: 1,
        orbitRadius: 13,
        orbitSpeed: 0.02,
        rotationSpeed: 0.02
    },
    moon: {
        name: '月球',
        description: '地球唯一的天然卫星',
        details: '公转周期：27天 | 距地球：38万公里',
        color: 0xcccccc,
        size: 0.27,
        orbitRadius: 2,
        orbitSpeed: 0.1,
        rotationSpeed: 0.01,
        parent: 'earth'
    },
    mars: {
        name: '火星',
        description: '红色星球，人类探索的重要目标',
        details: '公转周期：687天 | 温度：平均-63°C',
        color: 0xff6633,
        size: 0.5,
        orbitRadius: 17,
        orbitSpeed: 0.015,
        rotationSpeed: 0.018
    },
    jupiter: {
        name: '木星',
        description: '太阳系中最大的行星',
        details: '公转周期：12年 | 质量：地球的318倍',
        color: 0xffaa66,
        size: 2.5,
        orbitRadius: 23,
        orbitSpeed: 0.008,
        rotationSpeed: 0.04
    }
};

function init() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 40);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    createStarfield();
    createLighting();
    createPlanets();
    createOrbits();
    
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);
    
    animate();
}

function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 5000;
    const positions = new Float32Array(starsCount * 3);
    
    for (let i = 0; i < starsCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 500;
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        sizeAttenuation: true
    });
    
    const starfield = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starfield);
}

function createLighting() {
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    const sunLight = new THREE.PointLight(0xffffff, 2, 100);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
}

function createPlanets() {
    for (const [key, data] of Object.entries(planetData)) {
        let geometry, material;
        
        if (key === 'sun') {
            geometry = new THREE.SphereGeometry(data.size, 64, 64);
            material = new THREE.MeshBasicMaterial({ color: data.color });
            
            const glowGeometry = new THREE.SphereGeometry(data.size * 1.2, 64, 64);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            scene.add(glow);
        } else {
            geometry = new THREE.SphereGeometry(data.size, 32, 32);
            material = new THREE.MeshPhongMaterial({ color: data.color });
        }
        
        const planet = new THREE.Mesh(geometry, material);
        planet.userData = { name: key, info: data };
        
        if (data.parent) {
            planet.position.x = data.orbitRadius;
            planets.find(p => p.userData.name === data.parent).add(planet);
        } else {
            planet.position.x = data.orbitRadius;
            scene.add(planet);
        }
        
        planets.push(planet);
    }
}

function createOrbits() {
    for (const [key, data] of Object.entries(planetData)) {
        if (data.orbitRadius > 0 && !data.parent) {
            const orbitGeometry = new THREE.RingGeometry(data.orbitRadius - 0.02, data.orbitRadius + 0.02, 128);
            const orbitMaterial = new THREE.MeshBasicMaterial({
                color: 0x444444,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.3
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = -Math.PI / 2;
            scene.add(orbit);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    planets.forEach(planet => {
        const data = planetData[planet.userData.name];
        if (!data) return;
        
        planet.rotation.y += data.rotationSpeed;
        
        if (!data.parent && data.orbitSpeed > 0) {
            const angle = Date.now() * data.orbitSpeed * 0.001;
            planet.position.x = Math.cos(angle) * data.orbitRadius;
            planet.position.z = Math.sin(angle) * data.orbitRadius;
        }
        
        if (data.parent) {
            const angle = Date.now() * data.orbitSpeed * 0.001;
            planet.position.x = Math.cos(angle) * data.orbitRadius;
            planet.position.z = Math.sin(angle) * data.orbitRadius;
        }
    });
    
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(planets);
    
    if (intersects.length > 0) {
        const planet = intersects[0].object;
        const data = planet.userData.info;
        
        const panel = document.getElementById('info-panel');
        document.getElementById('planet-name').textContent = data.name;
        document.getElementById('planet-description').textContent = data.description;
        document.getElementById('planet-details').textContent = data.details;
        panel.style.display = 'block';
    }
}

init();

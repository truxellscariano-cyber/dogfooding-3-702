import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class SolarSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.celestialBodies = [];
        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();
        this.createStarfield();
        this.createLights();
        this.createSolarSystem();
        this.createOrbits();
        this.setupEventListeners();
        this.animate();
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
    }
    
    createCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 2000);
        this.camera.position.set(0, 30, 50);
        this.camera.lookAt(0, 0, 0);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }
    
    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 200;
        this.controls.enablePan = true;
    }
    
    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 10000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            const radius = 500 + Math.random() * 500;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            const colorValue = 0.5 + Math.random() * 0.5;
            colors[i3] = colorValue;
            colors[i3 + 1] = colorValue;
            colors[i3 + 2] = colorValue;
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });
        
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(starField);
    }
    
    createLights() {
        const ambientLight = new THREE.AmbientLight(0x222222, 0.5);
        this.scene.add(ambientLight);
        
        const sunLight = new THREE.PointLight(0xffffff, 2, 300);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        this.scene.add(sunLight);
    }
    
    createSolarSystem() {
        this.createSun();
        this.createMercury();
        this.createVenus();
        this.createEarth();
        this.createMars();
        this.createJupiter();
        this.createSaturn();
    }
    
    createSun() {
        const sunGeometry = new THREE.SphereGeometry(4, 64, 64);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xffdd00,
            emissive: 0xffdd00,
            emissiveIntensity: 1
        });
        
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.userData = {
            name: '太阳',
            description: '太阳系的中心恒星',
            details: '直径：139万公里 | 表面温度：5500°C',
            rotationSpeed: 0.001
        };
        
        const glowGeometry = new THREE.SphereGeometry(5, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        sun.add(glow);
        
        this.scene.add(sun);
        this.celestialBodies.push(sun);
    }
    
    createMercury() {
        const mercury = this.createPlanet({
            name: '水星',
            description: '离太阳最近的行星',
            details: '公转周期：88天 | 直径：4879公里',
            color: 0x8c8c8c,
            size: 0.5,
            orbitRadius: 8,
            orbitSpeed: 0.04,
            rotationSpeed: 0.005
        });
        this.celestialBodies.push(mercury);
    }
    
    createVenus() {
        const venus = this.createPlanet({
            name: '金星',
            description: '太阳系最热的行星',
            details: '公转周期：225天 | 表面温度：465°C',
            color: 0xffc649,
            size: 0.9,
            orbitRadius: 11,
            orbitSpeed: 0.03,
            rotationSpeed: 0.003
        });
        this.celestialBodies.push(venus);
    }
    
    createEarth() {
        const earth = this.createPlanet({
            name: '地球',
            description: '我们的家园',
            details: '公转周期：365天 | 直径：12742公里',
            color: 0x6b93d6,
            size: 1,
            orbitRadius: 15,
            orbitSpeed: 0.02,
            rotationSpeed: 0.02
        });
        
        const moon = this.createMoon({
            name: '月球',
            description: '地球的天然卫星',
            details: '公转周期：27天 | 距地球：38万公里',
            color: 0xaaaaaa,
            size: 0.27,
            orbitRadius: 2.5,
            orbitSpeed: 0.08,
            rotationSpeed: 0.01
        });
        
        earth.add(moon);
        this.celestialBodies.push(earth);
        this.celestialBodies.push(moon);
    }
    
    createMars() {
        const mars = this.createPlanet({
            name: '火星',
            description: '红色星球',
            details: '公转周期：687天 | 直径：6779公里',
            color: 0xc1440e,
            size: 0.6,
            orbitRadius: 20,
            orbitSpeed: 0.015,
            rotationSpeed: 0.018
        });
        this.celestialBodies.push(mars);
    }
    
    createJupiter() {
        const jupiter = this.createPlanet({
            name: '木星',
            description: '太阳系最大的行星',
            details: '公转周期：12年 | 直径：139820公里',
            color: 0xd8ca9d,
            size: 3,
            orbitRadius: 28,
            orbitSpeed: 0.008,
            rotationSpeed: 0.04
        });
        this.celestialBodies.push(jupiter);
    }
    
    createSaturn() {
        const saturn = this.createPlanet({
            name: '土星',
            description: '拥有美丽光环的行星',
            details: '公转周期：29年 | 直径：116460公里',
            color: 0xead6b8,
            size: 2.5,
            orbitRadius: 35,
            orbitSpeed: 0.006,
            rotationSpeed: 0.038
        });
        
        const ringGeometry = new THREE.RingGeometry(3.5, 5, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xc9b896,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        saturn.add(ring);
        
        this.celestialBodies.push(saturn);
    }
    
    createPlanet(config) {
        const geometry = new THREE.SphereGeometry(config.size, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: config.color,
            shininess: 10
        });
        
        const planet = new THREE.Mesh(geometry, material);
        planet.userData = {
            name: config.name,
            description: config.description,
            details: config.details,
            orbitRadius: config.orbitRadius,
            orbitSpeed: config.orbitSpeed,
            rotationSpeed: config.rotationSpeed,
            angle: Math.random() * Math.PI * 2
        };
        
        planet.position.x = config.orbitRadius;
        this.scene.add(planet);
        
        return planet;
    }
    
    createMoon(config) {
        const geometry = new THREE.SphereGeometry(config.size, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: config.color,
            shininess: 5
        });
        
        const moon = new THREE.Mesh(geometry, material);
        moon.userData = {
            name: config.name,
            description: config.description,
            details: config.details,
            orbitRadius: config.orbitRadius,
            orbitSpeed: config.orbitSpeed,
            rotationSpeed: config.rotationSpeed,
            angle: Math.random() * Math.PI * 2,
            isMoon: true
        };
        
        moon.position.x = config.orbitRadius;
        
        return moon;
    }
    
    createOrbits() {
        const orbitRadii = [8, 11, 15, 20, 28, 35];
        
        orbitRadii.forEach(radius => {
            const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, 2 * Math.PI, false, 0);
            const points = curve.getPoints(128);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            
            const material = new THREE.LineBasicMaterial({
                color: 0x444466,
                transparent: true,
                opacity: 0.4
            });
            
            const orbit = new THREE.Line(geometry, material);
            orbit.rotation.x = Math.PI / 2;
            this.scene.add(orbit);
        });
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('click', (event) => this.onMouseClick(event));
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const intersects = this.raycaster.intersectObjects(this.celestialBodies);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            const data = object.userData;
            
            if (data.name) {
                this.showInfo(data);
            }
        }
    }
    
    showInfo(data) {
        const panel = document.getElementById('info-panel');
        document.getElementById('planet-name').textContent = data.name;
        document.getElementById('planet-description').textContent = data.description;
        document.getElementById('planet-details').textContent = data.details;
        panel.style.display = 'block';
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();
        
        this.celestialBodies.forEach(body => {
            const data = body.userData;
            
            if (data.rotationSpeed) {
                body.rotation.y += data.rotationSpeed;
            }
            
            if (data.orbitRadius && data.orbitSpeed && !data.isMoon) {
                data.angle += data.orbitSpeed * delta;
                body.position.x = Math.cos(data.angle) * data.orbitRadius;
                body.position.z = Math.sin(data.angle) * data.orbitRadius;
            }
            
            if (data.isMoon && data.orbitRadius && data.orbitSpeed) {
                data.angle += data.orbitSpeed * delta;
                body.position.x = Math.cos(data.angle) * data.orbitRadius;
                body.position.z = Math.sin(data.angle) * data.orbitRadius;
            }
        });
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

const solarSystem = new SolarSystem();

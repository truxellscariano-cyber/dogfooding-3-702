import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ============================================
// 3D 太阳系模拟器 - 主程序
// ============================================

// 全局变量
let scene, camera, renderer, controls;
let planets = [];
let orbits = [];
let raycaster, mouse;
let selectedPlanet = null;
let infoPanel;

// 天体配置数据
const celestialBodies = [
  {
    name: '太阳',
    nameEn: 'Sun',
    type: 'star',
    radius: 8,
    color: 0xffaa00,
    emissive: 0xff6600,
    emissiveIntensity: 0.8,
    distance: 0,
    orbitSpeed: 0,
    rotationSpeed: 0.002,
    description: '太阳系的中心恒星，质量占整个太阳系的99.86%，为地球提供光和热。',
    temperature: '5,500°C (表面)'
  },
  {
    name: '水星',
    nameEn: 'Mercury',
    type: 'planet',
    radius: 1.2,
    color: 0x8c8c8c,
    distance: 20,
    orbitSpeed: 0.04,
    rotationSpeed: 0.01,
    description: '太阳系中最小且最靠近太阳的行星，表面布满陨石坑，温差极大。',
    temperature: '-173°C ~ 427°C'
  },
  {
    name: '金星',
    nameEn: 'Venus',
    type: 'planet',
    radius: 1.8,
    color: 0xffd700,
    distance: 28,
    orbitSpeed: 0.015,
    rotationSpeed: 0.005,
    description: '太阳系中最热的行星，拥有浓厚的二氧化碳大气层，表面温度极高。',
    temperature: '462°C (平均)'
  },
  {
    name: '地球',
    nameEn: 'Earth',
    type: 'planet',
    radius: 2,
    color: 0x2233ff,
    distance: 38,
    orbitSpeed: 0.01,
    rotationSpeed: 0.02,
    description: '我们的家园，太阳系中唯一已知存在生命的行星，拥有液态水和适宜的大气。',
    temperature: '15°C (平均)',
    hasMoon: true
  },
  {
    name: '火星',
    nameEn: 'Mars',
    type: 'planet',
    radius: 1.6,
    color: 0xff4500,
    distance: 50,
    orbitSpeed: 0.008,
    rotationSpeed: 0.018,
    description: '被称为"红色星球"，拥有太阳系最大的火山和峡谷，是人类探索的重点目标。',
    temperature: '-63°C (平均)'
  },
  {
    name: '木星',
    nameEn: 'Jupiter',
    type: 'planet',
    radius: 5,
    color: 0xd4a373,
    distance: 70,
    orbitSpeed: 0.004,
    rotationSpeed: 0.04,
    description: '太阳系最大的行星，是一颗气态巨行星，拥有著名的大红斑风暴。',
    temperature: '-108°C (平均)'
  }
];

// ============================================
// 初始化场景
// ============================================
function init() {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000510);

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 40, 80);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 10;
  controls.maxDistance = 200;

  // 创建射线检测器
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // 创建信息面板
  createInfoPanel();

  // 创建星空背景
  createStarField();

  // 创建光源
  createLights();

  // 创建天体
  createCelestialBodies();

  // 添加事件监听
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('click', onMouseClick);
  window.addEventListener('mousemove', onMouseMove);

  // 开始动画循环
  animate();
}

// ============================================
// 创建星空背景
// ============================================
function createStarField() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 3000;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 600;
    positions[i3 + 1] = (Math.random() - 0.5) * 600;
    positions[i3 + 2] = (Math.random() - 0.5) * 600;

    // 星星颜色变化
    const starType = Math.random();
    if (starType < 0.3) {
      colors[i3] = 0.8; colors[i3 + 1] = 0.8; colors[i3 + 2] = 1.0;
    } else if (starType < 0.6) {
      colors[i3] = 1.0; colors[i3 + 1] = 0.9; colors[i3 + 2] = 0.8;
    } else {
      colors[i3] = 1.0; colors[i3 + 1] = 1.0; colors[i3 + 2] = 1.0;
    }
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const starMaterial = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
}

// ============================================
// 创建光源
// ============================================
function createLights() {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
  scene.add(ambientLight);

  // 太阳光（点光源）
  const sunLight = new THREE.PointLight(0xffffff, 2, 200);
  sunLight.position.set(0, 0, 0);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  scene.add(sunLight);
}

// ============================================
// 创建天体
// ============================================
function createCelestialBodies() {
  celestialBodies.forEach(body => {
    // 创建行星组（用于公转）
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    // 创建轨道线
    if (body.distance > 0) {
      const orbitGeometry = new THREE.RingGeometry(
        body.distance - 0.1,
        body.distance + 0.1,
        128
      );
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x444444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      });
      const orbitRing = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbitRing.rotation.x = Math.PI / 2;
      scene.add(orbitRing);
    }

    // 创建天体网格
    const geometry = new THREE.SphereGeometry(body.radius, 32, 32);
    let material;

    if (body.type === 'star') {
      // 太阳材质 - 自发光
      material = new THREE.MeshBasicMaterial({
        color: body.color
      });
    } else {
      // 行星材质
      material = new THREE.MeshPhongMaterial({
        color: body.color,
        shininess: 25
      });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = body.distance;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // 存储天体数据
    mesh.userData = body;

    // 如果是太阳，添加光晕效果
    if (body.type === 'star') {
      const glowGeometry = new THREE.SphereGeometry(body.radius * 1.3, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: body.emissive || body.color,
        transparent: true,
        opacity: 0.3
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      mesh.add(glow);

      // 添加内部光晕
      const innerGlowGeometry = new THREE.SphereGeometry(body.radius * 1.1, 32, 32);
      const innerGlowMaterial = new THREE.MeshBasicMaterial({
        color: body.emissive || body.color,
        transparent: true,
        opacity: 0.5
      });
      const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
      mesh.add(innerGlow);
    }

    orbitGroup.add(mesh);

    // 如果是地球，创建月球
    if (body.hasMoon) {
      createMoon(orbitGroup, mesh, body.radius);
    }

    // 保存行星数据
    planets.push({
      mesh: mesh,
      orbitGroup: orbitGroup,
      data: body,
      angle: Math.random() * Math.PI * 2
    });
  });
}

// ============================================
// 创建月球
// ============================================
function createMoon(earthOrbitGroup, earthMesh, earthRadius) {
  const moonDistance = earthRadius * 4;
  const moonRadius = earthRadius * 0.27;

  // 月球轨道组
  const moonOrbitGroup = new THREE.Group();
  earthMesh.add(moonOrbitGroup);

  // 月球
  const moonGeometry = new THREE.SphereGeometry(moonRadius, 32, 32);
  const moonMaterial = new THREE.MeshPhongMaterial({
    color: 0xcccccc,
    shininess: 5
  });
  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.position.x = moonDistance;
  moon.castShadow = true;
  moon.receiveShadow = true;

  moon.userData = {
    name: '月球',
    nameEn: 'Moon',
    type: 'moon',
    description: '地球唯一的天然卫星，影响地球的潮汐，是人类唯一登陆过的地外天体。',
    temperature: '-173°C ~ 127°C'
  };

  moonOrbitGroup.add(moon);

  // 保存月球数据
  planets.push({
    mesh: moon,
    orbitGroup: moonOrbitGroup,
    data: {
      name: '月球',
      orbitSpeed: 0.05,
      rotationSpeed: 0.01,
      distance: moonDistance
    },
    angle: 0,
    isMoon: true
  });
}

// ============================================
// 创建信息面板
// ============================================
function createInfoPanel() {
  infoPanel = document.createElement('div');
  infoPanel.id = 'info-panel';
  infoPanel.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    background: rgba(0, 10, 30, 0.9);
    border: 1px solid rgba(100, 150, 255, 0.3);
    border-radius: 12px;
    padding: 20px;
    color: #fff;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    display: none;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    z-index: 1000;
  `;
  document.body.appendChild(infoPanel);

  // 添加标题样式
  const title = document.createElement('h2');
  title.textContent = '3D 太阳系模拟器';
  title.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    color: #fff;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 24px;
    margin: 0;
    text-shadow: 0 0 20px rgba(100, 150, 255, 0.5);
    z-index: 1000;
  `;
  document.body.appendChild(title);

  // 添加操作说明
  const instructions = document.createElement('div');
  instructions.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    color: rgba(255, 255, 255, 0.7);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    z-index: 1000;
  `;
  instructions.innerHTML = `
    <div>🖱️ 鼠标拖拽：旋转视角</div>
    <div>🔍 滚轮：缩放场景</div>
    <div>👆 点击天体：查看信息</div>
  `;
  document.body.appendChild(instructions);
}

// ============================================
// 显示天体信息
// ============================================
function showPlanetInfo(body) {
  const data = body.userData;

  infoPanel.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #64b5f6; font-size: 20px;">
      ${data.name} <span style="color: #888; font-size: 14px;">(${data.nameEn})</span>
    </h3>
    <p style="margin: 0 0 15px 0; line-height: 1.6; font-size: 14px; color: #ccc;">
      ${data.description}
    </p>
    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
      <div style="margin-bottom: 8px;">
        <span style="color: #888;">类型：</span>
        <span style="color: #fff;">${getTypeText(data.type)}</span>
      </div>
      ${data.temperature ? `
      <div>
        <span style="color: #888;">温度：</span>
        <span style="color: #fff;">${data.temperature}</span>
      </div>
      ` : ''}
    </div>
  `;

  infoPanel.style.display = 'block';
}

function getTypeText(type) {
  const typeMap = {
    'star': '恒星',
    'planet': '行星',
    'moon': '卫星'
  };
  return typeMap[type] || type;
}

// ============================================
// 隐藏天体信息
// ============================================
function hidePlanetInfo() {
  infoPanel.style.display = 'none';
  selectedPlanet = null;
}

// ============================================
// 鼠标点击事件
// ============================================
function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const planetMeshes = planets.map(p => p.mesh);
  const intersects = raycaster.intersectObjects(planetMeshes);

  if (intersects.length > 0) {
    const clickedPlanet = intersects[0].object;
    selectedPlanet = clickedPlanet;
    showPlanetInfo(clickedPlanet);
  } else {
    hidePlanetInfo();
  }
}

// ============================================
// 鼠标移动事件
// ============================================
function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const planetMeshes = planets.map(p => p.mesh);
  const intersects = raycaster.intersectObjects(planetMeshes);

  if (intersects.length > 0) {
    document.body.style.cursor = 'pointer';
  } else {
    document.body.style.cursor = 'default';
  }
}

// ============================================
// 窗口大小调整
// ============================================
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// 动画循环
// ============================================
function animate() {
  requestAnimationFrame(animate);

  // 更新行星位置和旋转
  planets.forEach(planet => {
    const data = planet.data;

    // 自转
    planet.mesh.rotation.y += data.rotationSpeed;

    // 公转
    if (!planet.isMoon && data.orbitSpeed > 0) {
      planet.angle += data.orbitSpeed * 0.01;
      planet.mesh.position.x = Math.cos(planet.angle) * data.distance;
      planet.mesh.position.z = Math.sin(planet.angle) * data.distance;
    } else if (planet.isMoon) {
      // 月球公转
      planet.orbitGroup.rotation.y += data.orbitSpeed * 0.01;
    }
  });

  // 更新控制器
  controls.update();

  // 渲染场景
  renderer.render(scene, camera);
}

// ============================================
// 启动程序
// ============================================
init();

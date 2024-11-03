import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js';

// Escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Activar sombras
document.body.appendChild(renderer.domElement);

// Variables para controlar la cámara con el mouse
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraAngleX = 0;
let cameraAngleY = 0;

// Cargar texturas de la carretera
const textureLoader = new THREE.TextureLoader();
const roadTexture = textureLoader.load('./texturas/asphalt/diff.jpg');
const displacementMap = textureLoader.load('./texturas/asphalt/disp_4k.jpg');
const normalMap = textureLoader.load('./texturas/asphalt/nor_gl_4k.jpg');
const roughnessMap = textureLoader.load('./texturas/asphalt/rough.jpg');

// Crear la carretera con las texturas
const roadGeometry = new THREE.PlaneGeometry(500, 1000);
const roadMaterial = new THREE.MeshStandardMaterial({
    map: roadTexture,
    displacementMap: displacementMap,
    displacementScale: 0.1,
    normalMap: normalMap,
    roughnessMap: roughnessMap,
    roughness: 0.8
});
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
road.receiveShadow = true; // La carretera recibe sombras
scene.add(road);

// Cargar el cube map para reflejos
const envMap = new THREE.CubeTextureLoader()
    .setPath('./texturas/cubo/')
    .load([
        'px.jpg', 'nx.jpg',
        'py.jpg', 'ny.jpg',
        'pz.jpg', 'nz.jpg'
    ]);
scene.background = envMap;

// Crear el vehículo con reflejos
const vehicleGeometry = new THREE.BoxGeometry(1, 1, 2);
const vehicleBodyTexture = textureLoader.load('./texturas/vehiculo/coche.jpg'); // Textura del coche
const vehicleMaterial = new THREE.MeshPhysicalMaterial({
    map: vehicleBodyTexture,    // Aplicar la textura del coche
    metalness: 1,               // Reflejos más fuertes
    roughness: 0.1,             // Acabado brillante
    envMap: envMap,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,   // Barniz liso
    reflectivity: 1
});
const vehicle = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
vehicle.position.set(0, 0.5, -5);
vehicle.castShadow = true; // El vehículo proyecta sombras
scene.add(vehicle);

// Añadir luces (tarde soleada)
const ambientLight = new THREE.AmbientLight(0xfffacd, 0.5); // Luz cálida suave
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffe7a1, 1.5); // Luz de sol
sunLight.position.set(50, 100, 50); // Simular el sol a cierta altura
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
scene.add(sunLight);

// Añadir una luz puntual para reflejos más intensos en el vehículo
const pointLight = new THREE.PointLight(0xffffff, 0.8, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Variables para controlar la cámara en primera y tercera persona
let isThirdPerson = true;

// Función para actualizar la posición de la cámara
function updateCameraPosition() {
    if (isThirdPerson) {
        // Tercera persona (detrás del vehículo)
        const radius = 10;
        const offsetX = radius * Math.sin(cameraAngleY) * Math.cos(cameraAngleX);
        const offsetY = Math.max(0, radius * Math.sin(cameraAngleX)); // Limitar la cámara para no pasar debajo del suelo
        const offsetZ = radius * Math.cos(cameraAngleY) * Math.cos(cameraAngleX);

        camera.position.set(vehicle.position.x + offsetX, vehicle.position.y + offsetY + 2, vehicle.position.z + offsetZ);
        camera.lookAt(vehicle.position);
    } else {
        // Primera persona (dentro del vehículo)
        camera.position.set(vehicle.position.x, vehicle.position.y + 1, vehicle.position.z + 0.1);
        camera.lookAt(vehicle.position.x, vehicle.position.y + 1, vehicle.position.z + 1);
    }
}

// Control de la cámara con el mouse en tercera persona
function onMouseMove(event) {
    if (isDragging && isThirdPerson) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        cameraAngleY -= deltaX * 0.005;
        cameraAngleX -= deltaY * 0.005;
        cameraAngleX = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, cameraAngleX)); // Limitar la rotación vertical

        updateCameraPosition();
    }
    previousMousePosition = { x: event.clientX, y: event.clientY };
}

function onMouseDown() {
    isDragging = true;
}

function onMouseUp() {
    isDragging = false;
}

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('mouseup', onMouseUp, false);

// Alternar entre primera y tercera persona al presionar "C"
window.addEventListener('keydown', (event) => {
    if (event.key === 'c' || event.key === 'C') {
        isThirdPerson = !isThirdPerson;
        updateCameraPosition();
    }
});

// Función de animación
function animate() {
    requestAnimationFrame(animate);
    
    // Movimiento del vehículo
    vehicle.position.z += 0.05;

    // Actualizar la posición de la cámara
    updateCameraPosition();

    // Renderizar la escena
    renderer.render(scene, camera);
}

// Iniciar la animación
animate();

// Ajustar el tamaño del renderizador cuando la ventana cambia de tamaño
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

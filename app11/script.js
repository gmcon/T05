import * as THREE from 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/jsm/controls/OrbitControls.js';

// Crear una escena, una cámara y un renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear la esfera
const geometry = new THREE.SphereGeometry(5, 32, 32);
const textureLoader = new THREE.TextureLoader();
const textures = [
    textureLoader.load("map.jpg"),      // Textura de la Tierra en día
    textureLoader.load("map2.png"),    // Textura de la Tierra en noche
    textureLoader.load("map3.png")   // Textura de la Tierra oceánica
];
let currentTextureIndex = 0; // Índice de la textura actual

const material = new THREE.MeshStandardMaterial({ map: textures[currentTextureIndex] });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Crear e incluir la luz
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Luz ambiental
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz direccional
directionalLight.position.set(5, 5, 5); // Posición de la luz
scene.add(directionalLight);

// Posicionar la cámara
camera.position.z = 10;

// Añadir OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

// Raycaster y mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const coordinatesDisplay = document.getElementById('coordinates'); // Elemento para mostrar coordenadas

// Añadir evento de clic
window.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
    // Calcular la posición del mouse en el espacio normalizado (-1 a +1) para ambos componentes
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Actualizar el raycaster con la cámara y la posición del mouse
    raycaster.setFromCamera(mouse, camera);

    // Calcular los objetos intersectados
    const intersects = raycaster.intersectObject(sphere);

    if (intersects.length > 0) {
        const point = intersects[0].point; // Punto de intersección
        displayCountryInfo(point); // Muestra información sobre el país

        // Cambiar textura al hacer clic
        currentTextureIndex = (currentTextureIndex + 1) % textures.length; // Alternar texturas
        sphere.material.map = textures[currentTextureIndex]; // Actualiza la textura
        sphere.material.needsUpdate = true; // Indica que la textura ha cambiado
    }
}

// Función para mostrar información
function displayCountryInfo(point) {
    // Actualiza el contenido del div con las coordenadas
    coordinatesDisplay.innerHTML = `Coordenadas: [${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)}]`;
}

// Controlar la rotación de la esfera con teclas
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': // Rotar hacia arriba
            sphere.rotation.x -= 0.1;
            break;
        case 's': // Rotar hacia abajo
            sphere.rotation.x += 0.1;
            break;
        case 'a': // Rotar hacia la izquierda
            sphere.rotation.y -= 0.1;
            break;
        case 'd': // Rotar hacia la derecha
            sphere.rotation.y += 0.1;
            break;
    }
});

// Animar la esfera
function animate() {
    requestAnimationFrame(animate);
    
    // Rotar la esfera lentamente
    sphere.rotation.y += 0.01; // Ajusta la velocidad de rotación aquí

    controls.update(); // Actualizar los controles
    renderer.render(scene, camera);
}

// Iniciar la animación
animate();

// Manejar el cambio de tamaño de la ventana
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

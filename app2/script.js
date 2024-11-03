// Importar Three.js y OrbitControls desde archivos locales
import * as THREE from './three.module.js';
import { OrbitControls } from './orbitcontrols.js';

// Configuración de escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);  // Fondo negro
document.body.appendChild(renderer.domElement);

// Control de órbita para mover la cámara con el ratón
const controls = new OrbitControls(camera, renderer.domElement);

// Crear la geometría de la esfera
const geometry = new THREE.SphereGeometry(1, 32, 32);

// Crear un material reflectante y de color gris para la esfera
const material = new THREE.MeshStandardMaterial({
    color: 0x808080,       // Gris para la esfera
    metalness: 0.8,        // Alto nivel de metalidad para reflejos
    roughness: 0.3,        // Un poco de rugosidad para un aspecto ligeramente mate
    reflectivity: 0.9      // Reflectividad alta
});

// Crear la esfera con el material gris y añadirla a la escena
const sphere = new THREE.Mesh(geometry, material);
sphere.position.set(0, -2, 0);  // Centrar la esfera más abajo para simular que cuelga
scene.add(sphere);

// Crear el cable como una línea que conecta la esfera con un punto superior
const cableGeometry = new THREE.BufferGeometry();
const cableVertices = new Float32Array([0, 0, 0, 0, -2, 0]); // Línea desde el techo hasta la esfera
cableGeometry.setAttribute('position', new THREE.BufferAttribute(cableVertices, 3));
const cableMaterial = new THREE.LineBasicMaterial({ color: 0xffffff }); // Color del cable
const cable = new THREE.Line(cableGeometry, cableMaterial);
scene.add(cable);

// Crear el pequeño cuadrado azul donde se sujeta el cable
const anchorGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2); // Un pequeño cubo (cuadrado en 2D)
const anchorMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Material azul para el cubo
const anchor = new THREE.Mesh(anchorGeometry, anchorMaterial);
anchor.position.set(0, 0, 0); // Posicionarlo donde comienza el cable
scene.add(anchor);

// Crear luces puntuales de colores que rodean la esfera y que se moverán
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff]; // Rojo, verde, azul, amarillo, magenta
const lights = [];
const radius = 4; // Radio del círculo de luces alrededor de la esfera

for (let i = 0; i < colors.length; i++) {
    const light = new THREE.PointLight(colors[i], 1, 10); // Crear una luz de color
    light.position.set(
        Math.cos(i * Math.PI * 2 / colors.length) * radius, // Posición en x
        2,                                                  // Altura (y)
        Math.sin(i * Math.PI * 2 / colors.length) * radius  // Posición en z
    );
    scene.add(light);
    lights.push(light);
}

// Añadir luz ambiental para dar un brillo general a la escena
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Luz tenue para no sobresaturar
scene.add(ambientLight);

// Posicionar la cámara
camera.position.z = 5;

// Variables para controlar el movimiento del péndulo
let swinging = false; // El péndulo no se mueve al principio
let angle = 0; // Ángulo inicial del péndulo
let speed = 0.03; // Velocidad angular, aumentada para un movimiento más exagerado
let amplitude = Math.PI / 8; // Amplitud inicial del péndulo (22.5 grados)
const maxAmplitude = Math.PI / 2; // Amplitud máxima del péndulo (90 grados)
let time = 0; // Variable para el tiempo

// Raycaster y vector para detectar clic en la esfera
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Función para generar un color aleatorio
function getRandomColor() {
    return Math.floor(Math.random() * 16777215); // Genera un número hexadecimal aleatorio
}

// Función para cambiar la posición de las luces aleatoriamente
function randomizeLightsPosition() {
    lights.forEach(light => {
        light.position.set(
            (Math.random() - 0.5) * radius * 2, // Posición aleatoria en el eje X
            (Math.random() - 0.5) * radius * 2, // Posición aleatoria en el eje Y
            (Math.random() - 0.5) * radius * 2  // Posición aleatoria en el eje Z
        );
    });
}

// Función para manejar clics
function onMouseClick(event) {
    // Normalizar las coordenadas del clic del ratón
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Actualizar el raycaster con la cámara y la posición del ratón
    raycaster.setFromCamera(mouse, camera);

    // Verificar intersecciones
    const intersects = raycaster.intersectObject(sphere);
    if (intersects.length > 0) {
        // Clic en la esfera: reiniciar la amplitud para un balanceo grande
        swinging = true;
        amplitude = maxAmplitude; // El balanceo será grande
    } else {
        // Clic fuera de la esfera: cambiar el color y posición de las luces
        lights.forEach(light => {
            light.color.set(getRandomColor()); // Cambiar a un color aleatorio
        });
        randomizeLightsPosition(); // Cambiar la posición de las luces
    }
}

// Animar la esfera (rotación y movimiento pendular) y actualizar el control de órbita
function animate() {
    requestAnimationFrame(animate);

    // Girar la esfera
    sphere.rotation.y += 0.01;

    // Movimiento del péndulo
    if (swinging) {
        angle = Math.sin(time) * amplitude; // Movimiento pendular basado en el seno
        sphere.position.x = Math.sin(angle) * 3; // Oscilar en el eje X, más exagerado
        time += speed; // Aumentar el tiempo para la oscilación

        // Actualizar la posición del cable para que siga la esfera
        const positions = cable.geometry.attributes.position.array;
        positions[3] = sphere.position.x; // Actualizar la posición del extremo inferior del cable en X
        cable.geometry.attributes.position.needsUpdate = true;

        // Disminuir gradualmente la amplitud para imitar un balanceo que se detiene
        amplitude *= 0.99;
        if (amplitude < Math.PI / 8) { // Límite mínimo de amplitud (22.5 grados)
            amplitude = Math.PI / 8;
        }
    }

    // Movimiento circular de las luces alrededor de la esfera
    lights.forEach((light, index) => {
        const lightAngle = time + index * (Math.PI * 2 / lights.length); // Crear un desfase angular para cada luz
        light.position.x = Math.cos(lightAngle) * radius;
        light.position.z = Math.sin(lightAngle) * radius;
    });

    // Actualizar los controles de la cámara (movimiento del ratón)
    controls.update();

    renderer.render(scene, camera);
}
animate();

// Ajustar el tamaño del render cuando la ventana cambia de tamaño
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Añadir evento de clic del ratón
window.addEventListener('click', onMouseClick);
// Instrucciones en pantalla
const instructions = document.createElement('div');
instructions.style.position = 'absolute';
instructions.style.top = '10px';
instructions.style.left = '10px';
instructions.style.color = 'lightyellow'; // Color de texto amarillo claro
instructions.style.fontSize = '16px';
instructions.style.fontFamily = 'Arial, sans-serif'; // Fuente
instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Fondo semitransparente
instructions.style.padding = '10px'; // Espaciado interno
instructions.style.borderRadius = '5px'; // Esquinas redondeadas
instructions.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)'; // Sombra
instructions.innerHTML = `
    <strong>Instrucciones:</strong><br>
    -Haz clic en la esfera para hacerla balancear.<br>
    -Haz clic fuera de la esfera para cambiar el color y posición de las luces.<br>
    -Usa el mouse para mover la cámara y explorar el entorno.
`;
document.body.appendChild(instructions);

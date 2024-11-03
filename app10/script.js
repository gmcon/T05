// Configuración básica de la escena, cámara y renderizador
const container = document.getElementById('container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Crear las esferas para horas, minutos y segundos
const geometry = new THREE.SphereGeometry(1, 32, 32);
const hourMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const minuteMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const secondMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

const hourSphere = new THREE.Mesh(geometry, hourMaterial);
const minuteSphere = new THREE.Mesh(geometry, minuteMaterial);
const secondSphere = new THREE.Mesh(geometry, secondMaterial);

scene.add(hourSphere);
scene.add(minuteSphere);
scene.add(secondSphere);

// Crear una esfera en el centro del reloj
const centerSphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
const centerSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const centerSphere = new THREE.Mesh(centerSphereGeometry, centerSphereMaterial);
scene.add(centerSphere);

// Crear un círculo (anillo) blanco sin fondo que rodea el reloj
const ringGeometry = new THREE.RingGeometry(9, 9.5, 64);
const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = Math.PI / 2;
scene.add(ring);

// Posicionar la cámara
camera.position.z = 15;

// Mostrar la hora en la esquina superior derecha
const topRightTime = document.getElementById('top-right-time');

// Mostrar la hora en la esquina inferior izquierda
const timeDisplay = document.getElementById('time-display');

// Variables para mantener la hora ajustada manualmente
let customHours = 0;
let customMinutes = 0;
let customSeconds = 0;

// Función para actualizar las posiciones de las esferas según la hora actual
function updateClock() {
    const now = new Date();
    const hours = customHours || now.getHours();
    const minutes = customMinutes || now.getMinutes();
    const seconds = customSeconds || now.getSeconds();

    const hourAngle = (hours % 12) * (Math.PI / 6);
    const minuteAngle = minutes * (Math.PI / 30);
    const secondAngle = seconds * (Math.PI / 30);

    hourSphere.position.x = 4 * Math.cos(hourAngle);
    hourSphere.position.y = 4 * Math.sin(hourAngle);

    minuteSphere.position.x = 6 * Math.cos(minuteAngle);
    minuteSphere.position.y = 6 * Math.sin(minuteAngle);

    secondSphere.position.x = 8 * Math.cos(secondAngle);
    secondSphere.position.y = 8 * Math.sin(secondAngle);

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timeDisplay.textContent = formattedTime;
    topRightTime.textContent = formattedTime;
}

// Actualizar la hora cuando se presiona el botón
document.getElementById('update-time-button').addEventListener('click', () => {
    const hoursInput = document.getElementById('hours').value;
    const minutesInput = document.getElementById('minutes').value;
    const secondsInput = document.getElementById('seconds').value;

    customHours = parseInt(hoursInput, 10);
    customMinutes = parseInt(minutesInput, 10);
    customSeconds = parseInt(secondsInput, 10);
});

// Centrar el reloj cuando se presiona el botón
document.getElementById('center-button').addEventListener('click', () => {
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);
});

// Ajustar el tamaño del canvas si cambia el tamaño del contenedor
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

function animate() {
    requestAnimationFrame(animate);
    updateClock();
    renderer.render(scene, camera);
}

animate();

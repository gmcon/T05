// Escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Fondo negro para mayor contraste

// Cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Posición inicial de la cámara

// Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true; // Habilitar las sombras
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombras suaves

// Textura para la esfera
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('texture.png'); // Asegúrate de tener un archivo 'texture.png'

// Geometría y material para la esfera
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshStandardMaterial({
  map: texture,
  roughness: 0.6,  // Ajusta la rugosidad
  metalness: 0.3   // Ajusta la metalicidad
});
const sphere = new THREE.Mesh(geometry, material);
sphere.castShadow = true;  // La esfera proyecta sombras
sphere.receiveShadow = true; // La esfera recibe sombras
scene.add(sphere);

// Luz puntual que sigue al mouse
const pointLight = new THREE.PointLight(0xffffff, 1, 100); // Luz blanca, intensidad 1
pointLight.position.set(0, 0, 5); // Posición inicial de la luz
pointLight.castShadow = true; // Permitir que la luz proyecte sombras
scene.add(pointLight);

// Luz direccional con sombras
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true; // Habilitar sombras proyectadas
scene.add(directionalLight);

// Variables iniciales
let rotationSpeed = 0.05;
let zoomSpeed = 0.5;

// Capturamos los sliders desde el DOM
const lightSlider = document.getElementById('lightIntensity');
const speedSlider = document.getElementById('rotationSpeed');

// Escuchamos los cambios del slider de la intensidad de la luz
lightSlider.addEventListener('input', (event) => {
  const intensity = parseFloat(event.target.value);
  pointLight.intensity = intensity; // Ajustamos la intensidad de la luz puntual
});

// Escuchamos los cambios del slider de la velocidad de rotación
speedSlider.addEventListener('input', (event) => {
  rotationSpeed = parseFloat(event.target.value); 
});

// Evento de teclado para manejar el zoom in (+) y zoom out (-)
document.addEventListener('keydown', (event) => {
  if (event.key === '+') {
    camera.position.z -= zoomSpeed; // Zoom in
  } else if (event.key === '-') {
    camera.position.z += zoomSpeed; // Zoom out
  }
});

// Movimiento del mouse para ajustar la posición de la luz
document.addEventListener('mousemove', (event) => {
  // Convertimos las coordenadas del mouse a un rango adecuado
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1; 
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  // Ajustamos la posición de la luz puntual en función del mouse
  pointLight.position.x = mouseX * 5; // Multiplicamos por 5 para mover la luz más rápido
  pointLight.position.y = mouseY * 5;
});

// Animación de la rotación
function animate() {
  requestAnimationFrame(animate);

  // Rotar la esfera con la velocidad ajustable
  sphere.rotation.y += rotationSpeed;

  // Renderizar la escena
  renderer.render(scene, camera);
}

animate();

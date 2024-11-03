// Escena
const scene = new THREE.Scene();

// Cámara
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

// Renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controles de la cámara
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  // Para suavizar el movimiento
controls.dampingFactor = 0.05;  // Factor de suavizado
controls.enableZoom = true;     // Permitir zoom con la rueda del mouse
controls.enablePan = true;      // Permitir moverse lateralmente
controls.enableRotate = true;   // Permitir rotación alrededor del objeto

// Raycaster y vector para las coordenadas del mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Cargar texturas
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('textures/sol.jpg');  // Textura del Sol
const planetTexture1 = textureLoader.load('textures/tierra.jpg');  // Textura del planeta 1
const planetTexture2 = textureLoader.load('textures/saturno.jpg');  // Textura del planeta 2
const planetTexture3 = textureLoader.load('textures/neptuno.jpg');  // Textura del planeta 3

// Crear el Sol (esfera central) con textura
const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.userData = { 
    name: 'Sol', 
    info: 'Temperatura:16 millones de ºC (centro)<br>Tipo: Estrella<br>Distancia a la Tierra: 150 millones de km' 
  };  // Información del Sol
  scene.add(sun);
  
  // Crear los planetas (esferas más pequeñas) con texturas
  const planetGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  
  // Planeta 1
  const planet1 = new THREE.Mesh(planetGeometry, new THREE.MeshBasicMaterial({ map: planetTexture1 }));
  planet1.userData = { 
    name: 'Tierra', 
    info: 'Diámetro: 12,742 km<br>Gravedad: 9.81 m/s²<br>Datos interesantes: Tiene vida.' 
  };
  
  // Planeta 2
  const planet2 = new THREE.Mesh(planetGeometry, new THREE.MeshBasicMaterial({ map: planetTexture2 }));
  planet2.userData = { 
    name: 'Saturno', 
    info: 'Diámetro: 116,460 km<br>Gravedad: Gravedad, 10.44 m/s²<br>Datos interesantes: Tiene un sistema de anillos.' 
  };
  
  // Planeta 3
  const planet3 = new THREE.Mesh(planetGeometry, new THREE.MeshBasicMaterial({ map: planetTexture3 }));
  planet3.userData = { 
    name: 'Neptuno', 
    info: 'Diámetro: 49,244 km<br>Gravedad: 3.7 m/s²<br>Datos interesantes: Está compuesto de una espesa mezcla de agua, amoniaco y metano.' 
  };

// Posiciones iniciales de los planetas
planet1.position.x = 5;
planet2.position.x = 7;
planet3.position.x = 9;

scene.add(planet1);
scene.add(planet2);
scene.add(planet3);

// Variables de animación
let angle1 = 0;
let angle2 = 0;
let angle3 = 0;
let animationId; // ID de la animación para detenerla

function animate() {
  animationId = requestAnimationFrame(animate);

  // Actualizar controles
  controls.update();

  // Rotación del Sol
  sun.rotation.y += 0.01;

  // Orbitar los planetas alrededor del sol
  angle1 += 0.01;
  angle2 += 0.008;
  angle3 += 0.006;

  planet1.position.x = 5 * Math.cos(angle1);
  planet1.position.z = 5 * Math.sin(angle1);
  
  planet2.position.x = 7 * Math.cos(angle2);
  planet2.position.z = 7 * Math.sin(angle2);
  
  planet3.position.x = 9 * Math.cos(angle3);
  planet3.position.z = 9 * Math.sin(angle3);

  // Rotación de los planetas
  planet1.rotation.y += 0.02; // Rotación del planeta 1
  planet2.rotation.y += 0.015; // Rotación del planeta 2
  planet3.rotation.y += 0.01; // Rotación del planeta 3

  renderer.render(scene, camera);
}

// Iniciar la animación
animate();

// Función para pausar la animación
function pauseAnimation() {
  cancelAnimationFrame(animationId);
  document.getElementById('pauseButton').style.display = 'none';
  document.getElementById('resumeButton').style.display = 'block';
}

// Función para reanudar la animación
function resumeAnimation() {
  animate();
  document.getElementById('pauseButton').style.display = 'block';
  document.getElementById('resumeButton').style.display = 'none';
}

// Función para mostrar el cuadro de información
function showInfoBox(name, info) {
  const infoBox = document.getElementById('infoBox');
  infoBox.style.display = 'block'; // Mostrar el cuadro
  infoBox.innerHTML = `<strong>${name}</strong><br>${info}`;

}

// Detectar clics en objetos 3D
window.addEventListener('click', (event) => {
  // Obtener las coordenadas del mouse normalizadas
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Actualizar el raycaster con la posición del mouse y la cámara
  raycaster.setFromCamera(mouse, camera);

  // Calcular los objetos que intersectan con el rayo
  const intersects = raycaster.intersectObjects([sun, planet1, planet2, planet3]);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    // Mostrar la información del objeto clicado en el cuadro de información
    showInfoBox(object.userData.name, object.userData.info);
  }
});

// Añadir eventos a los botones
document.getElementById('pauseButton').addEventListener('click', pauseAnimation);
document.getElementById('resumeButton').addEventListener('click', resumeAnimation);

// Ajuste de la ventana
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

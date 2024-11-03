// Crear la escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Color cielo azul (día)

// Crear la cámara (perspectiva)
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Crear el renderizador y agregarlo al documento
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Añadir controles de órbita
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Suavizar movimientos
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2; // Limita la rotación vertical
controls.minPolarAngle = 0;

// Luces
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Sol y Luna
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const moonGeometry = new THREE.SphereGeometry(3, 32, 32);
const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);

// Crear el pasto
const grassGeometry = new THREE.PlaneGeometry(100, 100);
const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
const grass = new THREE.Mesh(grassGeometry, grassMaterial);
grass.rotation.x = -Math.PI / 2;
grass.position.y = -1.5;
scene.add(grass);

// Materiales
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xffcc99 });
const roofMaterial = new THREE.MeshPhongMaterial({ color: 0xcc0000 });
const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x663300 });
const windowMaterial = new THREE.MeshPhongMaterial({ color: 0x87cefa });
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xa0522d }); // Color del piso

// Crear la casa
function createHouse(x, z) {
  // Crear la estructura de la casa (más grande)
  const houseGeometry = new THREE.BoxGeometry(10, 5, 6); // Tamaño de la casa ajustado
  const house = new THREE.Mesh(houseGeometry, wallMaterial);
  house.position.set(x, 0.5, z); // Ajuste para que la casa no flote
  scene.add(house);

  // Crear el piso
  const floorGeometry = new THREE.BoxGeometry(10, 0, 6);
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.set(x, -1, z); // Ajuste del piso a la base de la casa
  scene.add(floor);

  // Crear el techo
  const roofGeometry = new THREE.ConeGeometry(8, 3, 4); // Techo más grande
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.set(x, 4.5, z); // Ajuste de la posición del techo
  roof.rotation.y = 0.8; // Alinear techo con la casa
  scene.add(roof);

  // Crear puerta
  const doorGeometry = new THREE.BoxGeometry(1, 2, 0.1);
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(x, -0.5, z + 3.05); // Ajuste de posición de la puerta
  scene.add(door);

  // Crear ventanas
  const createWindow = (x, y, z) => {
    const windowGeometry = new THREE.BoxGeometry(1.5, 1, 0.05);
    const window = new THREE.Mesh(windowGeometry, windowMaterial);
    window.position.set(x, 1, z);
    scene.add(window);
  };

  // Ventanas de la casa
  createWindow(x - 3, 2.5, z + 3.05); // Ventana frontal izquierda
  createWindow(x + 3, 2.5, z + 3.05); // Ventana frontal derecha
  createWindow(x - 3, 2.5, z - 3.05); // Ventana trasera izquierda
  createWindow(x + 3, 2.5, z - 3.05); // Ventana trasera derecha

  // Añadir muebles simples dentro de la casa
  const furnitureGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); // Muebles simples
  const furnitureMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 }); // Color dorado para muebles

  // Crear algunos muebles
  const table = new THREE.Mesh(furnitureGeometry, furnitureMaterial);
  table.position.set(x, -0.5, z - 1); // Posicionar la mesa
  scene.add(table);

  const chair1 = new THREE.Mesh(furnitureGeometry, furnitureMaterial);
  chair1.position.set(x - 1, -0.5, z - 1); // Posicionar la silla
  scene.add(chair1);

  const chair2 = new THREE.Mesh(furnitureGeometry, furnitureMaterial);
  chair2.position.set(x + 1, -0.5, z - 1); // Posicionar la silla
  scene.add(chair2);

  // Configuración para abrir la puerta
  door.userData.isOpen = false;
  door.rotation.y = 0;

  door.onClick = () => {
    door.userData.isOpen = !door.userData.isOpen;
    door.rotation.y = door.userData.isOpen ? Math.PI / 2 : 0; // Girar la puerta
  };
}

// Crear una casa grande
createHouse(0, 0);

// Añadir árboles
const createTree = (x, z) => {
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
  const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.set(x, 0, z);
  scene.add(trunk);

  const foliageGeometry = new THREE.SphereGeometry(0.8, 32, 32);
  const foliageMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
  const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliage.position.set(x, 1, z);
  scene.add(foliage);
};

// Crear algunos árboles
createTree(-15, 10);
createTree(15, -10);
createTree(-15, -10);
createTree(15, 10);

// Crear un camino simple
const pathGeometry = new THREE.PlaneGeometry(2, 20);
const pathMaterial = new THREE.MeshPhongMaterial({ color: 0xC0C0C0 });
const path = new THREE.Mesh(pathGeometry, pathMaterial);
path.rotation.x = -Math.PI / 2;
path.position.y = -1.4;
scene.add(path);

// Movimiento del sol y luna
let time = 0;
const dayDuration = 0.002; // Ajusta este valor para ralentizar el movimiento del sol

// Función de animación
function animate() {
  requestAnimationFrame(animate);

  // Actualizar controles
  controls.update();

  // Movimiento del sol
  time += dayDuration;
  const sunY = Math.sin(time) * 20;
  const sunX = Math.cos(time) * 20;

  sun.position.set(sunX, sunY, 20);
  sunLight.position.set(sunX, sunY, 20);

  // Movimiento de la luna
  const moonY = Math.sin(time + Math.PI) * 20;
  const moonX = Math.cos(time + Math.PI) * 20;
  moon.position.set(moonX, moonY, 20);

  // Cambiar el color del cielo y la luz
  if (sunY < 0) {
    scene.background.set(0x000022); // Noche
    ambientLight.intensity = 0.5; // Aumentar la luz ambiental
    sunLight.intensity = 0; // Apagar la luz del sol
  } else {
    scene.background.set(0x87ceeb); // Día
    ambientLight.intensity = 0.4; // Luz ambiental de día
    sunLight.intensity = 1; // Luz del sol encendida
  }

  // Renderizar la escena
  renderer.render(scene, camera);
}

// Escuchar eventos de clic en la puerta
window.addEventListener('click', (event) => {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children);

  intersects.forEach((intersect) => {
    if (intersect.object.userData.isOpen !== undefined) {
      intersect.object.onClick(); // Abrir/cerrar puerta
    }
  });
});

// Posicionar la cámara
camera.position.set(20, 15, 30);
camera.lookAt(0, 0, 0);

// Manejar el redimensionamiento de la ventana
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

animate();

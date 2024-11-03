// Variables principales
let scene, camera, renderer, ball, light;
let velocity = new THREE.Vector3(0, 0, 0);
const acceleration = new THREE.Vector3(0, -9.8, 0); // gravedad en m/s^2
const damping = 0.8; // factor de frenado al colisionar
const floorFriction = 0.9; // fricción en el suelo
const radius = 1; // radio de la pelota
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]; // colores de rebote
const minVelocity = 0.05; // umbral mínimo de velocidad para cambiar color
const frameSize = 15; // tamaño del frame (área de rebote)
const stopThreshold = 0.01; // umbral para detener la pelota
const impulseStrength = 10; // fuerza de impulso aplicada por el clic

let dragging = false; // indica si se está arrastrando
let initialMousePosition = new THREE.Vector2(); // posición inicial del mouse
let lastMousePosition = new THREE.Vector2(); // última posición del mouse

// Inicialización de la escena
function init() {
  scene = new THREE.Scene();
  setupCamera();
  setupRenderer();
  setupLighting();
  createBall();
  createFrame();
  addEventListeners();
  animate();
}

// Configuración de la cámara
function setupCamera() {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 25;
}

// Configuración del renderer
function setupRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('container').appendChild(renderer.domElement);
}

// Configuración de la iluminación
function setupLighting() {
  light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7.5).normalize();
  scene.add(light);
  const ambientLight = new THREE.AmbientLight(0x404040); // luz ambiental tenue
  scene.add(ambientLight);
}

// Crear la pelota
function createBall() {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: colors[0], // color inicial
    metalness: 0,
    roughness: 0.5
  });
  ball = new THREE.Mesh(geometry, material);
  ball.position.set(0, 5, 0); // posición inicial en el centro del frame
  scene.add(ball);
}

// Crear el frame invisible
function createFrame() {
  const frameGeometry = new THREE.BoxGeometry(frameSize, frameSize, 0.1);
  const frameMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.set(0, 0, -0.05);
  scene.add(frame);
}

// Agregar eventos para mouse
function addEventListeners() {
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

// Manejar el clic del ratón
function onMouseDown(event) {
  const mouse = getMousePosition(event);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(ball);

  if (intersects.length > 0) {
    initialMousePosition.set(event.clientX, event.clientY);
    lastMousePosition.copy(initialMousePosition);
    dragging = true;
  }
}

// Manejar el movimiento del mouse
function onMouseMove(event) {
  if (dragging) {
    const currentMousePosition = new THREE.Vector2(event.clientX, event.clientY);
    const distanceDragged = currentMousePosition.distanceTo(lastMousePosition);
    const dragVector = new THREE.Vector3(
      (currentMousePosition.x - initialMousePosition.x) * 0.05,
      (currentMousePosition.y - initialMousePosition.y) * -0.05,
      0
    );
    velocity.addScaledVector(dragVector, distanceDragged);
    lastMousePosition.copy(currentMousePosition);
  }
}

// Manejar el fin del arrastre
function onMouseUp() {
  dragging = false;
}

// Obtener posición del mouse en coordenadas normalizadas
function getMousePosition(event) {
  return new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );
}

// Actualizar simulación
function animate() {
  requestAnimationFrame(animate);
  updatePhysics();
  renderer.render(scene, camera);
}

// Actualizar la física de la pelota
function updatePhysics() {
  velocity.addScaledVector(acceleration, 0.02); // integración simple (dt = 0.02)
  ball.position.addScaledVector(velocity, 0.02);
  checkCollisions();
}

// Verificar colisiones
function checkCollisions() {
  const { x, y } = ball.position;

  // Colisión con los límites
  if (y - radius <= -frameSize / 2 || y + radius >= frameSize / 2) {
    handleVerticalCollision(y);
  }
  if (x - radius <= -frameSize / 2 || x + radius >= frameSize / 2) {
    handleHorizontalCollision(x);
  }
}

// Manejar colisión vertical
function handleVerticalCollision(y) {
  const floorCollision = y - radius <= -frameSize / 2;
  ball.position.y = floorCollision ? -frameSize / 2 + radius : frameSize / 2 - radius; // ajustar posición
  if (Math.abs(velocity.y) > minVelocity) {
    velocity.y = -velocity.y * damping; // aplicar frenado por el choque
    velocity.x *= floorFriction; // aplicar fricción en eje X
    if (floorCollision) changeColor(); // cambiar color solo si colisiona con el suelo
  } else {
    velocity.y = 0; // detener la pelota si es muy lenta
  }
}

// Manejar colisión horizontal
function handleHorizontalCollision(x) {
  const leftCollision = x - radius <= -frameSize / 2;
  ball.position.x = leftCollision ? -frameSize / 2 + radius : frameSize / 2 - radius; // ajustar posición
  if (Math.abs(velocity.x) > minVelocity) {
    velocity.x = -velocity.x * damping; // rebotar
    changeColor(); // cambiar color solo si la pelota está rebotando
  } else {
    velocity.x = 0; // detener la pelota si es muy lenta
  }
}

// Cambiar color de la pelota y del texto al rebotar
function changeColor() {
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  ball.material.color.setHex(randomColor);

  // Cambiar el color del texto del h1
  const h1Element = document.querySelector('h1');
  h1Element.style.color = '#' + randomColor.toString(16).padStart(6, '0'); // Asegura que el color esté en formato hex
}

// Ajustar tamaño de la ventana
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Inicializar simulación
init();

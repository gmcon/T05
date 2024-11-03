// Configuración básica
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear luces
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

// Crear una barra de ejemplo
const createBar = (width, height, depth, color, x, z) => {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshPhongMaterial({ color });
  const bar = new THREE.Mesh(geometry, material);
  bar.position.set(x, height / 2, z); // Ajustar la posición
  scene.add(bar);
  return bar;
};

// Crear múltiples barras
const bars = [];
const numBars = 10;
for (let i = 0; i < numBars; i++) {
  const barHeight = Math.random() * 5 + 1; // Altura aleatoria
  const bar = createBar(1, barHeight, 1, 0x00ff00, i * 2 - (numBars), 0);
  bars.push(bar);
}

// Posicionar la cámara
camera.position.z = 10;

// Animar las barras
const animate = () => {
  requestAnimationFrame(animate);

  // Animar la altura de las barras
  bars.forEach(bar => {
    bar.scale.y = Math.abs(Math.sin(Date.now() * 0.001)) + 0.5;
  });

  renderer.render(scene, camera);
};

// Iniciar la animación
animate();

// Inicialización de escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Variables para contar kills
let kills = 0;
const killsElement = document.getElementById('kills');

// Cargar la textura del suelo (piso.jpg) y esperar a que cargue completamente
const textureLoader = new THREE.TextureLoader();
let floorTexture = null;

textureLoader.load('piso.jpg', function(texture) {
    floorTexture = texture;

    // Una vez que la textura esté lista, aplicar los ajustes
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);

    // Crear el suelo con la textura aplicada
    const floorMaterial = new THREE.MeshStandardMaterial({
        map: floorTexture
    });
    const floorGeometry = new THREE.PlaneGeometry(200, 200);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Una vez cargado el suelo, iniciamos la animación
    animate();
});

// Luz para proyectar sombras
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
scene.add(light);

// Crear la bola del péndulo
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const pendulum = new THREE.Mesh(sphereGeometry, sphereMaterial);
pendulum.position.set(0, 5, 0);
pendulum.castShadow = true;
scene.add(pendulum);

// Crear la cuerda del péndulo
const ropeGeometry = new THREE.CylinderGeometry(0.05, 0.05, 10);
const ropeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
const rope = new THREE.Mesh(ropeGeometry, ropeMaterial);
rope.position.set(0, 10, 0);
rope.rotation.z = Math.PI / 2;
scene.add(rope);

// Posicionar la cámara
camera.position.z = 15;
camera.position.y = 5;

// Variables para controlar el péndulo
let angle = 0;
let speed = 0.05;

// Slider para controlar el movimiento lateral del péndulo
const slider = document.getElementById('slider');
slider.addEventListener('input', function (event) {
    speed = parseFloat(event.target.value);
});

// Crear pájaros (esferas amarillas) y su movimiento
const birds = [];
for (let i = 0; i < 10; i++) {
    const birdGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const birdMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const bird = new THREE.Mesh(birdGeometry, birdMaterial);

    bird.position.set(
        Math.random() * 30 - 15, // X entre -15 y 15
        Math.random() * 10 + 5,  // Y entre 5 y 15
        Math.random() * 30 - 15  // Z entre -15 y 15
    );

    bird.castShadow = true;
    scene.add(bird);
    birds.push(bird);
}

// Función de animación, que ahora espera a que todos los elementos estén listos
function animate() {
    requestAnimationFrame(animate);

    // Movimiento del péndulo
    angle += speed;
    const pendulumX = Math.sin(angle) * 5;

    // Actualizar la posición de la bola y la cuerda del péndulo
    pendulum.position.x = pendulumX;
    rope.rotation.z = Math.sin(angle) * 0.1;

    // Movimiento de los pájaros
    birds.forEach(bird => {
        bird.position.x += (Math.random() - 0.5) * 0.1;
        bird.position.y += (Math.random() - 0.5) * 0.1;
    });

    renderer.render(scene, camera);
}

// Detección de clics en pájaros
renderer.domElement.addEventListener('click', function (event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(birds);
    if (intersects.length > 0) {
        const bird = intersects[0].object;
        scene.remove(bird);
        birds.splice(birds.indexOf(bird), 1);

        // Aumentar el contador de kills
        kills += 1;
        killsElement.innerHTML = `Kills: ${kills}`;
    }
});

// Ajustar el tamaño del renderizado al redimensionar la ventana
window.addEventListener('resize', function () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

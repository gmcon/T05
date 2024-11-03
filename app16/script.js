// Crear la escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Crear el renderizador
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear el tablero del puente (ahora de cemento)
const bridgeDeckGeometry = new THREE.BoxGeometry(20, 0.5, 5);  // Largo, alto, ancho
const bridgeDeckMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });  // Color gris para cemento
const bridgeDeck = new THREE.Mesh(bridgeDeckGeometry, bridgeDeckMaterial);
bridgeDeck.position.y = 5;  // Posicionar el tablero en el aire
scene.add(bridgeDeck);

// Crear los pilares del puente (usando geometrías de caja)
const pillarGeometry = new THREE.BoxGeometry(1, 5, 1);  // Tamaño de los pilares
const pillarMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });

const pillar1 = new THREE.Mesh(pillarGeometry, pillarMaterial);
pillar1.position.set(-8, 2.5, -2);
scene.add(pillar1);

const pillar2 = new THREE.Mesh(pillarGeometry, pillarMaterial);
pillar2.position.set(-8, 2.5, 2);
scene.add(pillar2);

const pillar3 = new THREE.Mesh(pillarGeometry, pillarMaterial);
pillar3.position.set(8, 2.5, -2);
scene.add(pillar3);

const pillar4 = new THREE.Mesh(pillarGeometry, pillarMaterial);
pillar4.position.set(8, 2.5, 2);
scene.add(pillar4);

// Añadir estructura triangular correctamente orientada y de color rojo
function createTriangleStructure() {
    const cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 14, 32);  // Cilindro delgado
    const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });  // Color rojo

    // Soportes desde la base del puente hacia un punto más alto en el centro (triángulo correcto)
    const leftSupport1 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    leftSupport1.position.set(-6, 8, -2.5);
    leftSupport1.rotation.z = -Math.PI / 3;  // Girar para que apunte hacia arriba
    scene.add(leftSupport1);

    const rightSupport1 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    rightSupport1.position.set(-6, 8, 2.5);
    rightSupport1.rotation.z = -Math.PI / 3;
    scene.add(rightSupport1);

    const leftSupport2 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    leftSupport2.position.set(6, 8, -2.5);
    leftSupport2.rotation.z = Math.PI / 3;  // Girar para que apunte hacia arriba
    scene.add(leftSupport2);

    const rightSupport2 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    rightSupport2.position.set(6, 8, 2.5);
    rightSupport2.rotation.z = Math.PI / 3;
    scene.add(rightSupport2);

    // Barra superior que conecta las partes superiores de los triángulos
    const topBar1 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    topBar1.scale.y = 0.5;  // Hacer la barra más corta
    topBar1.position.set(0, 8, -2.5);
    topBar1.rotation.z = 0;  // Sin rotación, para que sea horizontal
    scene.add(topBar1);

    const topBar2 = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    topBar2.scale.y = 0.5;
    topBar2.position.set(0, 8, 2.5);
    topBar2.rotation.z = 0;
    scene.add(topBar2);
}

// Crear la estructura triangular tipo puente Golden Gate
createTriangleStructure();

// Crear los pilares adicionales para sujetar las barandas del puente
const pillarGeometry2 = new THREE.BoxGeometry(0.5, 2, 0.5);
const pillarMaterial2 = new THREE.MeshBasicMaterial({ color: 0x808080 });

const pillar5 = new THREE.Mesh(pillarGeometry2, pillarMaterial2);
pillar5.position.set(10.5, 6, 2.5);
scene.add(pillar5);

const pillar6 = new THREE.Mesh(pillarGeometry2, pillarMaterial2);
pillar6.position.set(-10.5, 6, 2.5);
scene.add(pillar6);

const pillar7 = new THREE.Mesh(pillarGeometry2, pillarMaterial2);
pillar7.position.set(10.5, 6, -2.5);
scene.add(pillar7);

const pillar8 = new THREE.Mesh(pillarGeometry2, pillarMaterial2);
pillar8.position.set(-10.5, 6, -2.5);
scene.add(pillar8);

// Crear las barandas laterales del puente (usando cilindros)
const railGeometry = new THREE.CylinderGeometry(0.1, 0.1, 21, 32);
const railMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

const rail1 = new THREE.Mesh(railGeometry, railMaterial);
rail1.position.set(0, 6, -2.5);
rail1.rotation.z = Math.PI / 2;
scene.add(rail1);

const rail2 = new THREE.Mesh(railGeometry, railMaterial);
rail2.position.set(0, 6, 2.5);
rail2.rotation.z = Math.PI / 2;
scene.add(rail2);

// Crear el suelo debajo del puente
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;  // Rotar el plano para que sea horizontal
ground.position.y = 0;
scene.add(ground);

// Crear agua más ancha que pase por debajo del puente
const waterGeometry = new THREE.PlaneGeometry(10, 50);  // Hacemos el agua más ancha
const waterMaterial = new THREE.MeshBasicMaterial({ color: 0x1E90FF, transparent: true, opacity: 0.6 });
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2;
water.position.set(0, 0.1, 0);  // Justo por debajo del puente, centrado entre los pilares
scene.add(water);

// Crear los caminos a cada lado del puente (cubos grises más largos)
const roadGeometry = new THREE.BoxGeometry(15, 5.5, 10);  // Largo, alto, ancho
const roadMaterial = new THREE.MeshBasicMaterial({ color: 0xA9A9A9 });  // Color gris para simular el concreto

const road1 = new THREE.Mesh(roadGeometry, roadMaterial);
road1.position.set(-17.5, 2.5, 0);  // Colocar a la izquierda del puente
scene.add(road1);

const road2 = new THREE.Mesh(roadGeometry, roadMaterial);
road2.position.set(17.5, 2.5, 0);  // Colocar a la derecha del puente
scene.add(road2);

// Crear los caminitos sobre los caminos/montañas
const pathGeometry = new THREE.BoxGeometry(15, 0.2, 4);  // Largo, altura, ancho
const pathMaterial = new THREE.MeshBasicMaterial({ color: 0x696969 });  // Color gris oscuro para los caminitos

// Camino izquierdo
const path1 = new THREE.Mesh(pathGeometry, pathMaterial);
path1.position.set(-17.5, 5.2, 0);  // Colocado sobre el primer "montaña/camino"
scene.add(path1);

// Camino derecho
const path2 = new THREE.Mesh(pathGeometry, pathMaterial);
path2.position.set(17.5, 5.2, 0);  // Colocado sobre el segundo "montaña/camino"
scene.add(path2);

// Variable para almacenar los autos
let cars = [];

// Función para crear un auto
function createCar() {
    const carGeometry = new THREE.BoxGeometry(2, 1, 1);  // Tamaño del auto
    const carMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });  // Color rojo
    const car = new THREE.Mesh(carGeometry, carMaterial);
    car.position.set(-23, 5.7, 0);  // Posicionar el auto al inicio del primer camino
    scene.add(car);
    return car;
}

// Variables para el movimiento de los autos
let moveCars = [];
let carPositionsX = [];

// Función para mover los autos
function animateCars() {
    for (let i = 0; i < cars.length; i++) {
        const car = cars[i];
        if (moveCars[i]) {
            if (carPositionsX[i] < -10) {
                // Mover sobre el primer camino
                carPositionsX[i] += 0.1;
                car.position.set(carPositionsX[i], 5.7, 0);
            } else if (carPositionsX[i] >= -10 && carPositionsX[i] < 10) {
                // Mover sobre el puente
                carPositionsX[i] += 0.1;
                car.position.set(carPositionsX[i], 5.7, 0);
            } else if (carPositionsX[i] >= 10 && carPositionsX[i] < 23) {
                // Mover sobre el segundo camino
                carPositionsX[i] += 0.1;
                car.position.set(carPositionsX[i], 5.7, 0);
            } else {
                // Eliminar el auto cuando llega al final
                scene.remove(car);
                cars.splice(i, 1);  // Eliminar de la lista de autos
                moveCars.splice(i, 1);  // Eliminar el movimiento asociado
                carPositionsX.splice(i, 1);  // Eliminar la posición
                i--;  // Ajustar el índice porque eliminamos un auto
            }
        }
    }
}

// Evento para detectar cuando se presiona la tecla espacio
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        const newCar = createCar();  // Crear un nuevo auto
        cars.push(newCar);  // Agregar el auto a la lista de autos
        moveCars.push(true);  // Activar el movimiento para este auto
        carPositionsX.push(-23);  // Inicializar la posición X del auto
    }
});

// Posicionar la cámara
camera.position.z = 40;
camera.position.y = 15;
camera.lookAt(0, 5, 0);

// Añadir luces (opcional)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10).normalize();
scene.add(light);

// Añadir controles de órbita para mover la cámara
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Mejora la suavidad del movimiento
controls.dampingFactor = 0.25; 
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;  // Limita la cámara para no ir por debajo del puente

// Función de animación
function animate() {
    requestAnimationFrame(animate);
    animateCars();  // Actualizar la posición de los autos
    controls.update();  // Actualizar los controles en cada frame
    renderer.render(scene, camera);
}
animate();

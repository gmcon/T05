// Variables para el control del campo magnético
let fieldIntensity = 5;
let polaridad = 1; // 1 = normal, -1 = invertido
let angle = 0;

// Configuración básica de Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(600, 600);
document.getElementById("canvas-container").appendChild(renderer.domElement);

// Crear el planeta (esfera)
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const planet = new THREE.Mesh(geometry, material);
scene.add(planet);

// Polos magnéticos (pequeñas esferas)
const poleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const northPole = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), poleMaterial);
const southPole = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), poleMaterial);
scene.add(northPole, southPole);

camera.position.z = 5;

// Función para crear líneas de flujo del campo magnético
const lines = [];
function createMagneticField() {
    const fieldLines = new THREE.Group();
    const curveMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff, opacity: 0.5, transparent: true });

    for (let i = 0; i < 30; i++) {
        const curve = new THREE.EllipseCurve(
            0, 0,                            // Centro
            2 + fieldIntensity * 0.1, 2 + fieldIntensity * 0.1, // Radio x, y
            0, 2 * Math.PI,                   // Inicio y fin del ángulo
            false,                            // Sentido
            angle * Math.PI / 180             // Rotación
        );
        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, curveMaterial);
        line.rotation.x = (Math.random() - 0.5) * Math.PI;
        line.rotation.y = (Math.random() - 0.5) * Math.PI;
        lines.push(line);
        fieldLines.add(line);
    }
    scene.add(fieldLines);
}

// Función para actualizar la posición de los polos magnéticos
function updatePoles() {
    northPole.position.set(0, 1, 0);
    southPole.position.set(0, -1, 0);
    northPole.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle * polaridad * Math.PI / 180);
    southPole.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle * polaridad * Math.PI / 180);
}

// Render loop
function animate() {
    requestAnimationFrame(animate);

    // Rotar el planeta
    planet.rotation.y += 0.01;

    // Actualizar las líneas de campo
    lines.forEach(line => line.rotation.y += 0.01);

    renderer.render(scene, camera);
}

animate();
createMagneticField();
updatePoles();

// Eventos de control para cambiar intensidad, polaridad y ángulo
document.getElementById("intensity").addEventListener("input", function (e) {
    fieldIntensity = e.target.value;
    scene.clear();
    createMagneticField();
    updatePoles();
});

document.getElementById("changePolaridad").addEventListener("click", function () {
    polaridad = polaridad === 1 ? -1 : 1;
    updatePoles();
});

document.getElementById("angulo").addEventListener("input", function (e) {
    angle = e.target.value;
    updatePoles();
});

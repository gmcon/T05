// Configuración de la escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let circleRadius = 5; // Radio inicial del círculo
const triangleCount = 36; // Aumentar el número de triángulos para un aspecto más circular
const triangles = [];
let angleOffsets = []; // Para el movimiento circular
let rotationSpeed = 0.01;
let circleSpeed = 0.01;
let colorChangeSpeed = 0.01;
let colorPatternIndex = 0; // Índice del patrón de color

// Variables para el movimiento
let circleMovementSpeed = 0.02; // Velocidad de movimiento del círculo
let directionX = 1; // Dirección horizontal
let directionY = 1; // Dirección vertical

// Crear triángulos isósceles y agregarlos a la escena
for (let i = 0; i < triangleCount; i++) {
    const triangleGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        0, 0.5, 0,   // Vértice superior (más alto para darle volumen)
        -0.5, -0.5, 0, // Vértice inferior izquierdo
        0.5, -0.5, 0   // Vértice inferior derecho
    ]);
    triangleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const triangleMaterial = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
    const triangleMesh = new THREE.Mesh(triangleGeometry, triangleMaterial);
    
    // Posicionar el triángulo en el círculo
    const angle = (i / triangleCount) * Math.PI * 2;
    triangleMesh.position.set(circleRadius * Math.cos(angle), circleRadius * Math.sin(angle), 0);
    
    // Rotar el triángulo para que se vea bien en 3D
    triangleMesh.rotation.z = angle + Math.PI / 2; // Girar para que el triángulo apunte hacia afuera
    triangles.push(triangleMesh);
    angleOffsets.push(angle);
    scene.add(triangleMesh);
}

camera.position.z = 10;

// Elementos del DOM para controlar la animación
const rotationSpeedInput = document.getElementById('rotation-speed');
const circleSpeedInput = document.getElementById('circle-speed');
const colorSpeedInput = document.getElementById('color-speed');
const togglePatternButton = document.getElementById('toggle-pattern');

// Actualizar la velocidad de rotación
rotationSpeedInput.addEventListener('input', (event) => {
    rotationSpeed = parseFloat(event.target.value);
    document.getElementById('rotation-speed-label').textContent = rotationSpeed.toFixed(3);
});

// Actualizar la velocidad de movimiento en el círculo
circleSpeedInput.addEventListener('input', (event) => {
    circleSpeed = parseFloat(event.target.value);
    document.getElementById('circle-speed-label').textContent = circleSpeed.toFixed(3);
});

// Actualizar la velocidad de cambio de color
colorSpeedInput.addEventListener('input', (event) => {
    colorChangeSpeed = parseFloat(event.target.value);
    document.getElementById('color-speed-label').textContent = colorChangeSpeed.toFixed(3);
});

// Alternar patrones de color
togglePatternButton.addEventListener('click', () => {
    colorPatternIndex = (colorPatternIndex + 1) % 5; // Ciclar entre 5 patrones
});

// Ajustar el tamaño del círculo con la rueda del mouse
window.addEventListener('wheel', (event) => {
    if (event.deltaY < 0) {
        circleRadius += 0.5; // Aumentar el radio
    } else {
        circleRadius = Math.max(1, circleRadius - 0.5); // Disminuir el radio, mínimo 1
    }
});

// Función de animación
function animate() {
    requestAnimationFrame(animate);

    // Mover el círculo
    triangles.forEach((triangle, index) => {
        triangle.rotation.z += rotationSpeed; // Rotar alrededor del eje Z

        // Mover el triángulo en el círculo
        angleOffsets[index] += circleSpeed;
        triangle.position.set(circleRadius * Math.cos(angleOffsets[index]), circleRadius * Math.sin(angleOffsets[index]), 0);
        
        // Mover el triángulo a través de la pantalla
        triangle.position.x += circleMovementSpeed * directionX;
        triangle.position.y += circleMovementSpeed * directionY;

        // Comprobar colisiones con los límites de la pantalla
        if (triangle.position.x > window.innerWidth / 100 || triangle.position.x < -window.innerWidth / 100) {
            directionX *= -1; // Invertir dirección horizontal
        }
        if (triangle.position.y > window.innerHeight / 100 || triangle.position.y < -window.innerHeight / 100) {
            directionY *= -1; // Invertir dirección vertical
        }

        // Cambiar color de los triángulos según el patrón seleccionado
        switch (colorPatternIndex) {
            case 0: // Patrón de colores cíclicos
                const colorShift = (Date.now() * colorChangeSpeed + index * 20) % 360;
                triangle.material.color.setHSL(colorShift / 360, 1, 0.5);
                break;
            case 1: // Patrón aleatorio
                triangle.material.color.set(Math.random() * 0xffffff);
                break;
            case 2: // Patrón basado en el tiempo
                const colorValue = (Math.sin(Date.now() * colorChangeSpeed + index) + 1) / 2;
                triangle.material.color.setRGB(colorValue, 1 - colorValue, 0);
                break;
            case 3: // Patrón de arcoíris
                const rainbowShift = (index / triangleCount + Date.now() * colorChangeSpeed / 1000) % 1;
                triangle.material.color.setHSL(rainbowShift, 1, 0.5);
                break;
            case 4: // Patrón de colores pastel
                const pastelShift = (Date.now() * colorChangeSpeed + index * 20) % 360;
                triangle.material.color.setHSL(pastelShift / 360, 0.5, 0.8);
                break;
        }
    });

    renderer.render(scene, camera);
}

animate();

// Ajustar el tamaño del canvas al redimensionar la ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

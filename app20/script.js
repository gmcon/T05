// Escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Datos dinámicos para el gráfico de barras
let data = Array.from({ length: 10 }, () => Math.random() * 10);
const bars = [];
const barWidth = 0.5;
const barSpacing = 1;
const maxBarHeight = 10;  // Limitar la altura máxima de las barras

// Crear las barras 3D iniciales
data.forEach((value, index) => {
    const geometry = new THREE.BoxGeometry(barWidth, value, barWidth);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 1 });
    const bar = new THREE.Mesh(geometry, material);

    bar.position.set(index * barSpacing, value / 2, 0);
    scene.add(bar);
    bars.push(bar);
});

// Crear los ejes X e Y
const materialLine = new THREE.LineBasicMaterial({ color: 0xffffff });

const pointsX = [];
pointsX.push(new THREE.Vector3(-1, 0, 0));
pointsX.push(new THREE.Vector3(10, 0, 0));

const geometryX = new THREE.BufferGeometry().setFromPoints(pointsX);
const lineX = new THREE.Line(geometryX, materialLine);
scene.add(lineX);

const pointsY = [];
pointsY.push(new THREE.Vector3(0, -1, 0));
pointsY.push(new THREE.Vector3(0, maxBarHeight, 0));

const geometryY = new THREE.BufferGeometry().setFromPoints(pointsY);
const lineY = new THREE.Line(geometryY, materialLine);
scene.add(lineY);

// Posicionar la cámara centrada en el gráfico
const centerX = (data.length - 1) * barSpacing / 2;  // Centro del gráfico en X
camera.position.set(centerX, 0, 15);  // Cámara en y=0 y a una distancia z=15
camera.lookAt(centerX, 0, 0);  // Apuntar al centro del gráfico (eje Y en 0)

// Función para actualizar los datos dinámicos
function updateData() {
    data = data.map(() => Math.random() * maxBarHeight);  // Limitar los valores al máximo permitido

    // Encontrar la barra de mayor y menor valor
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);

    // Actualizar colores y animaciones
    bars.forEach((bar, index) => {
        const value = data[index];

        // Barra con valor máximo en azul, mínimo en rojo, las demás en verde
        if (value === maxValue) {
            bar.material.color.set(0x0000ff);  // Azul
        } else if (value === minValue) {
            bar.material.color.set(0xff0000);  // Rojo
        } else {
            bar.material.color.set(0x00ff00);  // Verde
        }

        // Desvanecimiento de aparición/desaparición
        bar.material.opacity = 0;  // Comienza transparente
        setTimeout(() => {
            bar.material.opacity = 1;  // Aparece después de 200ms
        }, 200);
    });
}

// Función para actualizar el tamaño de las barras de manera animada
function animateBars() {
    bars.forEach((bar, index) => {
        const targetHeight = data[index];
        const currentHeight = bar.scale.y;
        const growthSpeed = 0.1;

        // Animar el crecimiento y decrecimiento de las barras
        if (currentHeight < targetHeight) {
            bar.scale.y += growthSpeed;
        } else if (currentHeight > targetHeight) {
            bar.scale.y -= growthSpeed;
        }

        // Limitar la altura de las barras para que no pasen del valor máximo
        if (bar.scale.y > maxBarHeight) {
            bar.scale.y = maxBarHeight;
        }

        // Actualizar la posición de las barras para que crezcan desde la base
        bar.position.y = bar.scale.y * bar.geometry.parameters.height / 2;

        // Efecto de desvanecimiento
        if (bar.material.opacity < 1) {
            bar.material.opacity += 0.05;  // Incrementar opacidad gradualmente
        }
    });
}

// Función de animación
function animate() {
    requestAnimationFrame(animate);
    animateBars();
    renderer.render(scene, camera);
}

// Iniciar animación
animate();

// Actualizar los datos cada segundo
setInterval(updateData, 1000);

// Ajustar el renderizador al cambiar el tamaño de la ventana
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

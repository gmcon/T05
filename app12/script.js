import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

// Crear la escena, la cámara y el renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Configurar la posición de la cámara
camera.position.z = 5;

// Crear geometría del plano más pequeño
const geometry = new THREE.PlaneGeometry(6, 6, 100, 100); // Plano de 6x6 unidades, con 100 segmentos

// Shader personalizado para la animación de las olas y los patrones de onda
const material = new THREE.ShaderMaterial({
    vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uWaveIntensity;
        uniform int uWaveType;
        uniform float uFrequency;
        uniform float uAmplitude;
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            vec3 pos = position;

            float frequency = uFrequency;
            float amplitude = uAmplitude;

            // Efecto de la onda expansiva según el tipo seleccionado
            float distanceFromMouse = distance(uv, uMouse);
            float waveEffect = 0.0;

            if (uWaveType == 0) {
                // Onda circular
                waveEffect = exp(-distanceFromMouse * 5.0) * sin(distanceFromMouse * 10.0 - uTime * 5.0);
            } else if (uWaveType == 1) {
                // Onda elíptica
                waveEffect = exp(-distanceFromMouse * 7.0) * sin((uv.x * uv.x * 20.0 + uv.y * 10.0) - uTime * 5.0);
            } else if (uWaveType == 2) {
                // Onda personalizada con mayor frecuencia
                waveEffect = exp(-distanceFromMouse * 5.0) * sin(distanceFromMouse * 15.0 - uTime * 8.0);
            }
            
            waveEffect *= smoothstep(0.0, 1.0, 1.0 - distanceFromMouse);
            waveEffect *= uWaveIntensity;

            // Combinar el efecto de la onda expansiva y las olas base
            pos.z = sin(pos.x * frequency + uTime) * amplitude;
            pos.z += cos(pos.y * frequency + uTime) * amplitude;
            pos.z += waveEffect * 0.5;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
            gl_FragColor = vec4(uColor, 1.0); // Usar el color uniforme
        }
    `,
    uniforms: {
        uTime: { value: 0.0 },
        uMouse: { value: new THREE.Vector2(-1, -1) }, // Inicialmente fuera del rango del plano
        uWaveIntensity: { value: 0.0 }, // Intensidad inicial de la onda
        uWaveType: { value: 0 }, // Tipo de onda inicial (circular)
        uFrequency: { value: 3.0 }, // Frecuencia inicial
        uAmplitude: { value: 0.2 }, // Amplitud inicial
        uColor: { value: new THREE.Color(0x0077ff) } // Color inicial del plano
    },
    wireframe: true // Puedes desactivar esto para un plano sólido
});

// Crear el plano
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

// Crear un raycaster para detectar clics
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Variable para controlar el estado de la onda
let waveActive = false;
let waveStartTime = 0;

// Función para generar un color aleatorio
function getRandomColor() {
    return new THREE.Color(Math.random(), Math.random(), Math.random());
}

// Función para actualizar la posición del clic y cambiar el color
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(plane);
    if (intersects.length > 0) {
        const uv = intersects[0].uv;

        material.uniforms.uColor.value = getRandomColor();

        if (!waveActive) {
            material.uniforms.uMouse.value = uv;
            material.uniforms.uWaveIntensity.value = 1.0; // Iniciar la intensidad de la onda
            waveActive = true;
            waveStartTime = performance.now(); // Guardar el tiempo de inicio de la onda
        }
    }
}

// Escuchar el evento de clic
window.addEventListener('click', onMouseClick);

// Configurar GUI
const gui = new dat.GUI();
const waveTypes = { Circular: 0, Elíptica: 1, FrecuenciaAlta: 2 };
const waveSettings = {
    tipoDeOnda: 'Circular',
    frecuencia: 3.0,
    amplitud: 0.2,
};
gui.add(waveSettings, 'tipoDeOnda', Object.keys(waveTypes)).name('Tipo de Onda').onChange(value => {
    material.uniforms.uWaveType.value = waveTypes[value];
});
gui.add(waveSettings, 'frecuencia', 1.0, 10.0).step(0.1).name('Frecuencia').onChange(value => {
    material.uniforms.uFrequency.value = value;
});
gui.add(waveSettings, 'amplitud', 0.1, 1.0).step(0.1).name('Amplitud').onChange(value => {
    material.uniforms.uAmplitude.value = value;
});

// Función de animación
function animate(time) {
    material.uniforms.uTime.value = time / 1000;

    if (waveActive) {
        const elapsedTime = (time - waveStartTime) / 1000;
        const fadeDuration = 1.5;
        material.uniforms.uWaveIntensity.value = Math.max(0.0, 1.0 - (elapsedTime / fadeDuration));

        if (material.uniforms.uWaveIntensity.value <= 0.0) {
            waveActive = false;
            material.uniforms.uMouse.value.set(-1, -1);
        }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Iniciar la animación
animate();

// Ajustar el tamaño del renderizador al cambiar el tamaño de la ventana
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

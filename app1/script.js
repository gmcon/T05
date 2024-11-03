let scene, camera, renderer, cubes = [];
let analyser, dataArray, audioSource, duration = 0, currentTime = 0;
let audioContext, clock = new THREE.Clock();
let fileInput = document.getElementById('audio-upload');
let fileNameDisplay = document.getElementById('file-name');
let timeDisplay = document.getElementById('time');
let messageDisplay = document.getElementById('message');
let changeColorButton = document.getElementById('animacion');
let colors = [0x800080, 0xff69b4, 0xffff00, 0xff0000, 0x008000, 0x00ffff, 0x0000ff, 0x8b4513, 0xffa500];
let currentColorIndex = 0;
let animating = false; // Estado de la animación
let colorChangeInterval; // Variable para almacenar el intervalo

// Inicializar la aplicación
function init() {
    setupScene();
    setupAudioControls();
    animate();
}

// Configuración de la escena Three.js
function setupScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 39;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Control de cámara
    let controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Crear cubos iniciales
    createCubes(10);
}

// Configuración de eventos para el audio
function setupAudioControls() {
    fileInput.addEventListener('change', handleAudioUpload);
    changeColorButton.addEventListener('click', toggleColorAnimation); // Evento para el botón
}

// Crear cubos con tamaño y posición aleatoria
function createCubes(count) {
    for (let i = 0; i < count; i++) {
        const size = Math.random() * 1.9 + 0.5;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshBasicMaterial({ color: colors[currentColorIndex], wireframe: true });
        const cube = new THREE.Mesh(geometry, material);

        // Posición aleatoria para toda la escena
        cube.position.set(
            Math.random() * 50 - 25,
            Math.random() * 30 - 15,
            Math.random() * 40 - 20
        );

        cube.userData = { originalSize: size };
        cubes.push(cube);
        scene.add(cube);
    }
}

// Cambiar el color de los cubos
function changeCubeColor() {
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    cubes.forEach(cube => cube.material.color.set(colors[currentColorIndex]));
}

// Función para activar o desactivar la animación de cambio de color
function toggleColorAnimation() {
    animating = !animating; // Cambia el estado de animación

    if (animating) {
        // Iniciar la animación de cambio de color
        colorChangeInterval = setInterval(changeCubeColor, 3000);
        changeColorButton.textContent = "Animación Activada";
    } else {
        // Detener la animación de cambio de color
        clearInterval(colorChangeInterval);
        changeColorButton.textContent = "Animación Desactivada";
    }
}

// Animación principal
function animate() {
    requestAnimationFrame(animate);
    updateCubes();
    updateAudioTime();
    renderer.render(scene, camera);
}

// Actualizar los cubos en función del audio
function updateCubes() {
    cubes.forEach(cube => {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        if (analyser) {
            analyser.getByteFrequencyData(dataArray);
            let avgFreq = getAverageFrequency(dataArray);
            cube.material.opacity = Math.min(1, avgFreq / 255 + 0.3);
            cube.material.transparent = true;
        }
    });

    if (analyser) {
        adjustCubes(Math.min(90, Math.max(10, Math.floor(getAverageFrequency(dataArray) / 2))));
        resizeCubes();
    }
}

// Actualizar el tiempo de reproducción del audio
function updateAudioTime() {
    if (!audioSource) return;
    
    currentTime = audioContext.currentTime;
    updateTimeDisplay();

    if (currentTime >= duration) {
        audioSource.stop();
        currentTime = 0; // Reiniciar el contador
        updateTimeDisplay(); // Actualizar la visualización inmediatamente
        messageDisplay.style.display = 'block';
    }
}

// Ajustar la cantidad de cubos en la escena
function adjustCubes(targetCount) {
    while (cubes.length < targetCount) {
        createCubes(1);
    }
    while (cubes.length > targetCount) {
        let cube = cubes.pop();
        scene.remove(cube);
    }
}

// Cambiar el tamaño de los cubos según la frecuencia
function resizeCubes() {
    cubes.forEach((cube, i) => {
        let scaleFactor = Math.max(0.5, Math.min(dataArray[i] / 128, 2));
        cube.scale.set(scaleFactor, scaleFactor, scaleFactor);
    });
}

// Manejar la carga del archivo de audio
function handleAudioUpload(event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = e => {
        setupAudio(e.target.result, file.name);
        fileInput.value = ""; // Restablecer el valor para permitir la recarga del mismo archivo
    };
    reader.readAsArrayBuffer(file);
}

// Configurar el análisis de audio
function setupAudio(audioData, fileName) {
    // Reiniciar el contexto de audio para comenzar desde cero
    if (audioContext) audioContext.close();
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    audioContext.decodeAudioData(audioData, buffer => {
        if (audioSource) audioSource.disconnect();
        
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = buffer;
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
        audioSource.start(0);

        fileNameDisplay.textContent = "Archivo: " + fileName;
        duration = buffer.duration;
        currentTime = 0;
        messageDisplay.style.display = 'none';
    });
}

// Mostrar el tiempo actual del audio
function updateTimeDisplay() {
    let minutes = Math.floor(currentTime / 60);
    let seconds = Math.floor(currentTime % 60);
    let durationMinutes = Math.floor(duration / 60);
    let durationSeconds = Math.floor(duration % 60);

    timeDisplay.textContent = `Tiempo: ${minutes}:${seconds < 10 ? '0' + seconds : seconds} / ${durationMinutes}:${durationSeconds < 10 ? '0' + durationSeconds : durationSeconds}`;
}

// Calcular la frecuencia promedio
function getAverageFrequency(data) {
    let sum = data.reduce((a, b) => a + b, 0);
    return sum / data.length;
}

// Iniciar la aplicación
init();

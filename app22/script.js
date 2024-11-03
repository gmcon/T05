let scene, camera, renderer, material;
let moveSpeedX = 0.05;
let moveSpeedY = 0.03;
let directionX = 1;
let directionY = 1;
let emissiveChangeSpeed = 0.01;
let blinkSpeed = 0.005;
let blinkIntensity = 0;

let currentText = "¡Hola Mundo 3D!";
let textCount = 1; // Número de veces que aparece el texto
let maxTextCount = 10;
let minTextCount = 1;

let textMeshes = []; // Almacenamos aquí las mallas de texto para reutilizarlas
let fontLoaded = null; // Almacenamos la fuente cargada para reutilizarla

function init() {
    scene = new THREE.Scene();

    // Cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    // Renderizador
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Fondo con gradiente
    const canvas = renderer.domElement;
    canvas.style.background = 'linear-gradient(135deg, #1f4037, #99f2c8)'; // Fondo degradado

    // Luz ambiental y punto de luz
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    // Cargar la fuente y crear el texto 3D
    loadTextGeometry();

    // Cambiar dirección al hacer clic
    window.addEventListener('click', function () {
        directionX *= -1;
        directionY *= -1;
    });

    // Ajustar tamaño del render al cambiar tamaño de la ventana
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    // Evento para cambiar el texto con la barra de búsqueda
    const textInput = document.getElementById('textInput');
    textInput.addEventListener('input', (event) => {
        currentText = event.target.value || "Texto vacío";
        updateText();
    });

    // Botón para aumentar el número de texto
    document.getElementById('increaseText').addEventListener('click', () => {
        if (textCount < maxTextCount) {
            textCount++;
            updateText();
        }
    });

    // Botón para disminuir el número de texto
    document.getElementById('decreaseText').addEventListener('click', () => {
        if (textCount > minTextCount) {
            textCount--;
            updateText();
        }
    });
}

function loadTextGeometry() {
    const loader = new THREE.FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        fontLoaded = font; // Guardamos la fuente cargada
        material = new THREE.MeshPhongMaterial({
            color: 0xff0000, // Color base
            shininess: 100, // Reflejos brillantes
            emissive: 0x550000, // Color del brillo
            emissiveIntensity: 0.5, // Intensidad inicial del brillo
            transparent: true,
            opacity: 1 // Opacidad inicial
        });

        createTextMeshes(); // Crear las mallas de texto
        animate();
    });
}

function createTextMeshes() {
    for (let i = 0; i < maxTextCount; i++) {
        const geometry = new THREE.TextGeometry(currentText, {
            font: fontLoaded, // Usamos la fuente cargada
            size: 1,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: 5
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.visible = i < textCount; // Solo los primeros "textCount" textos serán visibles
        textMeshes.push(mesh);
        scene.add(mesh);
    }
}

function updateText() {
    // Comprobamos que la fuente haya sido cargada antes de actualizar
    if (fontLoaded) {
        // Actualizar el texto sin destruir toda la escena
        textMeshes.forEach((mesh, index) => {
            if (index < textCount) {
                mesh.visible = true;
                mesh.geometry.dispose(); // Eliminar la geometría anterior
                mesh.geometry = new THREE.TextGeometry(currentText, {
                    font: fontLoaded, // Reutilizamos la fuente cargada
                    size: 1,
                    height: 0.2,
                    curveSegments: 12,
                    bevelEnabled: true,
                    bevelThickness: 0.03,
                    bevelSize: 0.05,
                    bevelOffset: 0,
                    bevelSegments: 5
                });
                mesh.position.x = -5 + index * 1.5; // Posicionar el texto
            } else {
                mesh.visible = false; // Ocultar los textos que exceden el "textCount"
            }
        });
    }
}

function animate(time) {
    requestAnimationFrame(animate);

    // Movimiento del texto
    textMeshes.forEach((mesh) => {
        if (mesh.visible) {
            mesh.position.x += moveSpeedX * directionX;
            mesh.position.y += moveSpeedY * directionY;

            // Rebote en los bordes
            if (mesh.position.x > 5 || mesh.position.x < -5) directionX *= -1;
            if (mesh.position.y > 3 || mesh.position.y < -3) directionY *= -1;

            // Rotación del texto
            mesh.rotation.x += 0.01;
            mesh.rotation.y += 0.01;

            // Efecto de brillo pulsante
            material.emissiveIntensity += emissiveChangeSpeed;
            if (material.emissiveIntensity > 1 || material.emissiveIntensity < 0.1) {
                emissiveChangeSpeed *= -1;
            }

            // Efecto de parpadeo
            blinkIntensity += blinkSpeed;
            if (blinkIntensity > 1 || blinkIntensity < 0) {
                blinkSpeed *= -1;
            }
            material.opacity = Math.abs(Math.sin(blinkIntensity * Math.PI));
        }
    });

    // Renderizar la escena
    renderer.render(scene, camera);
}

init();

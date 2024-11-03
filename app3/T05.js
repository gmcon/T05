<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script>
    // Crear la escena
    const scene = new THREE.Scene();

    // Crear la cámara
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Crear el renderizador
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Variables para la geometría y el material
    let geometry;
    let material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
    let shape = new THREE.Mesh(geometry, material);

    // Añadir la forma inicial (pirámide) a la escena
    scene.add(shape);

    // Posicionar la cámara
    camera.position.z = 20;

    // Variables para el movimiento
    let direction = 1;
    let speed = 0.02;
    let angle = 0;
    let movementDirection = new THREE.Vector3(1, 0, 0);

    // Efectos de partículas (lluvia, nieve, destellos)
    let particles = new THREE.Group();
    scene.add(particles);

    const particleCount = 1000;
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2,
        map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png'),
        transparent: true
    });

    let particleGeometry = new THREE.BufferGeometry();
    let particlePositions = [];
    for (let i = 0; i < particleCount; i++) {
        particlePositions.push(Math.random() * 200 - 100);
        particlePositions.push(Math.random() * 200 - 100);
        particlePositions.push(Math.random() * 200 - 100);
    }

    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));

    let particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    particles.add(particleSystem);

    // Fondo de estrellas en movimiento
    let starsGeometry = new THREE.BufferGeometry();
    let starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, opacity: 0.8, transparent: true });
    let starPositions = [];
    for (let i = 0; i < 5000; i++) {
        starPositions.push(Math.random() * 2000 - 1000);
        starPositions.push(Math.random() * 2000 - 1000);
        starPositions.push(Math.random() * 2000 - 1000);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    let starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // Fondo de nubes en movimiento
    const cloudTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/particles/snowflake.png');
    let clouds = new THREE.Mesh(
        new THREE.PlaneGeometry(2000, 2000),
        new THREE.MeshBasicMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.2
        })
    );
    clouds.position.set(0, 0, -500);
    scene.add(clouds);

    // Función para crear la geometría según la forma seleccionada
    function createGeometry() {
        const selectedShape = document.getElementById('shape').value;
        const size = document.getElementById('size').value;
        const height = document.getElementById('height').value;

        // Eliminar la forma anterior
        scene.remove(shape);

        switch (selectedShape) {
            case 'cone':
                geometry = new THREE.ConeGeometry(size, height, 4);
                break;
            case 'cube':
                geometry = new THREE.BoxGeometry(size, size, size);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(size, 32, 32);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(size, 2, 16, 100);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(size, size, height, 32);
                break;
            case 'dodecahedron':
                geometry = new THREE.DodecahedronGeometry(size);
                break;
            case 'octahedron':
                geometry = new THREE.OctahedronGeometry(size);
                break;
            case 'icosahedron':
                geometry = new THREE.IcosahedronGeometry(size);
                break;
            case 'tetrahedron':
                geometry = new THREE.TetrahedronGeometry(size);
                break;
        }

        shape = new THREE.Mesh(geometry, material);
        scene.add(shape);
    }

    // Función de animación
    function animate() {
        requestAnimationFrame(animate);

        // Actualizar el ángulo de movimiento
        angle = document.getElementById('angle').value;
        angle = THREE.MathUtils.degToRad(angle); // Convertir grados a radianes

        // Calcular el movimiento de la forma
        shape.position.x += speed * direction * Math.cos(angle);
        shape.position.z += speed * direction * Math.sin(angle);

        // Reaccionar al movimiento del ratón
        window.addEventListener('mousemove', (event) => {
            const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
            shape.position.x = mouseX * 10;
            shape.position.y = mouseY * 10;
        });

        // Animar partículas (lluvia o nieve)
        particleSystem.rotation.y += 0.002;

        // Estrellas en movimiento
        starField.rotation.x += 0.0001;
        starField.rotation.y += 0.0002;

        // Mover nubes
        clouds.position.x += 0.01;

        // Actualizar el color de la forma
        const color = document.getElementById('color').value;
        shape.material.color.set(color);

        // Renders
        renderer.render(scene, camera);
    }

    // Función para ajustar la velocidad
    document.getElementById('speed').addEventListener('input', (e) => {
        speed = e.target.value;
    });

    // Función para seleccionar la forma
    document.getElementById('shape').addEventListener('change', createGeometry);
    document.getElementById('size').addEventListener('input', createGeometry);
    document.getElementById('height').addEventListener('input', createGeometry);

    // Función para la música ambiental y efectos de sonido
    let ambientSound = new Audio('ambient-sound.mp3'); // Música ambiental
    ambientSound.loop = true;
    ambientSound.volume = 0.1;
    ambientSound.play();

    let soundEffect = new Audio('particle-effect.mp3'); // Efecto de sonido para partículas
    soundEffect.volume = 0.2;
    soundEffect.play();

    // Comenzar la animación
    animate();
</script>

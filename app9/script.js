let scene, camera, renderer, particleSystem, particleCount = 1000;
let particles = [];
let minParticleSize = 0.05;
let maxParticleSize = 0.5; // Aumento del tamaño máximo de las partículas
let growthRate = 0.01; // Tasa de crecimiento de partículas
let moveSpeed = 0.2; // Velocidad de movimiento lateral de la cámara
let zoomSpeed = 0.5; // Velocidad de zoom
let particleBounds = 10; // Límite de generación inicial de partículas

// Inicialización de la escena
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000); // Aumentar el far plane para permitir zoom infinito
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createParticles();

    animate();

    // Agregar el listener del teclado
    window.addEventListener('keydown', onKeyDown); // Escuchar eventos de teclado
    window.addEventListener('click', changeDirection);
}

// Crear partículas
function createParticles() {
    let particleMaterial = new THREE.PointsMaterial({
        size: minParticleSize,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        vertexColors: true
    });

    let particleGeometry = new THREE.BufferGeometry();
    let positions = new Float32Array(particleCount * 3);
    let opacities = new Float32Array(particleCount);
    let colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        let x = (Math.random() - 0.5) * 20;
        let y = (Math.random() - 0.5) * 20;
        let z = (Math.random() - 0.5) * 20;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        opacities[i] = Math.random() * 0.5 + 0.5;

        colors[i * 3] = Math.random();
        colors[i * 3 + 1] = Math.random();
        colors[i * 3 + 2] = Math.random();

        // Asignar un tamaño y nivel de atracción aleatorio
        let size = Math.random() * (maxParticleSize - minParticleSize) + minParticleSize; // Tamaño aleatorio
        let attractionLevel = size; // El nivel de atracción es igual al tamaño
        let lifetime = Math.random() * 10000 + 5000; // Tiempo de vida aleatorio entre 5000 y 15000 ms

        particles.push({
            position: new THREE.Vector3(x, y, z),
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05), // Velocidad inicial
            size: size,
            attractionLevel: attractionLevel,
            growth: 0, // Tiempo de crecimiento actual
            lifetime: lifetime, // Tiempo de vida total
            createdAt: Date.now() // Tiempo de creación
        });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
}

// Generar nuevas partículas en áreas visibles
function generateNewParticles() {
    let newParticles = [];
    let positions = particleSystem.geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
        let x = (Math.random() - 0.5) * particleBounds * 2;
        let y = (Math.random() - 0.5) * particleBounds * 2;
        let z = (Math.random() - 0.5) * particleBounds * 2;

        // Verificar si la nueva posición de la partícula está fuera de los límites
        if (Math.abs(x) > particleBounds || Math.abs(y) > particleBounds || Math.abs(z) > particleBounds) {
            let newPosition = new THREE.Vector3(x, y, z);
            positions[i * 3] = newPosition.x;
            positions[i * 3 + 1] = newPosition.y;
            positions[i * 3 + 2] = newPosition.z;

            let size = Math.random() * (maxParticleSize - minParticleSize) + minParticleSize; // Tamaño aleatorio
            let attractionLevel = size; // El nivel de atracción es igual al tamaño
            let lifetime = Math.random() * 10000 + 5000; // Tiempo de vida aleatorio entre 5000 y 15000 ms

            newParticles.push({
                position: newPosition,
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05), // Velocidad inicial
                size: size,
                attractionLevel: attractionLevel,
                growth: 0, // Tiempo de crecimiento actual
                lifetime: lifetime, // Tiempo de vida total
                createdAt: Date.now() // Tiempo de creación
            });
        }
    }

    particles.push(...newParticles);
    particleSystem.geometry.attributes.position.needsUpdate = true;
}

// Cambiar la dirección de las partículas al hacer clic
function changeDirection() {
    particles.forEach(p => {
        p.velocity.set(
            (Math.random() - 0.5) * 0.05, // Velocidad aleatoria al cambiar dirección
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05
        );
    });
}

// Mover la cámara según la entrada del teclado
function onKeyDown(event) {
    switch (event.key) {
        case 'ArrowUp':
            camera.position.z -= zoomSpeed; // Zoom in
            break;
        case 'ArrowDown':
            camera.position.z += zoomSpeed; // Zoom out
            break;
        case 'ArrowLeft':
            camera.position.x -= moveSpeed; // Mover hacia la izquierda
            break;
        case 'ArrowRight':
            camera.position.x += moveSpeed; // Mover hacia la derecha
            break;
    }

    // Generar nuevas partículas si la cámara se ha movido fuera de los límites
    if (Math.abs(camera.position.x) > particleBounds || Math.abs(camera.position.y) > particleBounds || Math.abs(camera.position.z) > particleBounds) {
        particleBounds += 10; // Aumentar los límites de generación de partículas
        generateNewParticles(); // Generar nuevas partículas en las áreas visibles
    }
}

// Animar el sistema de partículas
function animate() {
    requestAnimationFrame(animate);

    let positions = particleSystem.geometry.attributes.position.array;

    // Ajustar el tamaño de las partículas según la posición de la cámara
    let zoomFactor = 1 / camera.position.z; // Factor de zoom basado en la posición Z de la cámara
    particleSystem.material.size = Math.max(minParticleSize, maxParticleSize * zoomFactor); // Cambiar el tamaño de las partículas

    for (let i = 0; i < particles.length; i++) {
        let particle = particles[i];

        // Actualizar el tamaño de la partícula
        if (Date.now() - particle.createdAt < particle.lifetime) {
            particle.growth += growthRate;
            particle.size = Math.min(particle.size + growthRate, maxParticleSize); // Aumentar el tamaño hasta el máximo
        } else {
            // Al terminar la vida de la partícula, generamos dos nuevas partículas
            if (particle.size === maxParticleSize) {
                generateNewParticles(); // Generar nuevas partículas
            }
            // Marcar para eliminar
            particle.size = 0; // Hacer que la partícula desaparezca
        }

        // Actualizar la posición de las partículas
        particle.position.add(particle.velocity);

        // Aplicar atracción hacia las partículas más grandes
        for (let j = 0; j < particles.length; j++) {
            if (i !== j) {
                let otherParticle = particles[j];
                let distance = particle.position.distanceTo(otherParticle.position);

                // Si la distancia es corta, mover la partícula pequeña hacia la grande
                if (distance < 2 && particle.attractionLevel < otherParticle.attractionLevel) {
                    let attractionForce = otherParticle.attractionLevel / distance; // Fuerza de atracción inversamente proporcional a la distancia
                    let direction = new THREE.Vector3().subVectors(otherParticle.position, particle.position).normalize();
                    particle.velocity.add(direction.multiplyScalar(attractionForce * 0.01)); // Ajustar la velocidad de la partícula
                }
            }
        }

        // Actualizar la posición en el buffer
        positions[i * 3] = particle.position.x;
        positions[i * 3 + 1] = particle.position.y;
        positions[i * 3 + 2] = particle.position.z;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true; // Indicar que las posiciones han cambiado
    renderer.render(scene, camera);
}

// Inicializar la escena
init();

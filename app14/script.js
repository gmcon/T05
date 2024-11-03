// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadow maps for more realistic lighting
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows for better visuals
document.body.appendChild(renderer.domElement);

// Set a blue sky background
scene.background = new THREE.Color(0x87ceeb); // Light sky blue

// Set up the physics world
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // Gravity in the physics world

// Create a plane (the ground) with shadow in Three.js
const planeGeometry = new THREE.PlaneGeometry(100, 100); // Larger terrain
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Green color for grass
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1;
plane.receiveShadow = true;
scene.add(plane);

// Create the plane in Cannon.js for collision detection
const groundMaterial = new CANNON.Material("groundMaterial");
const planeBody = new CANNON.Body({
    mass: 0, // Mass of 0 makes the ground static
    material: groundMaterial,
});
const planeShape = new CANNON.Plane();
planeBody.addShape(planeShape);
planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
planeBody.position.set(0, -1, 0);
world.addBody(planeBody);

// Lighting setup for shadows
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
light.castShadow = true;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 100;
light.shadow.camera.left = -50;
light.shadow.camera.right = 50;
light.shadow.camera.top = 50;
light.shadow.camera.bottom = -50;
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft ambient light
scene.add(ambientLight);

// List of Three.js objects and Cannon.js bodies
let objects = [];
let previewObject = null;
let previewMarker = null; // Red 'X' marker for preview

// Set camera position
camera.position.set(10, 10, 20);
camera.lookAt(0, 0, 0);

// Update the preview based on the mouse position and input changes
document.addEventListener('mousemove', updatePreview);
document.getElementById('shape').addEventListener('change', updatePreview);
document.getElementById('size').addEventListener('input', updatePreview);
document.getElementById('height').addEventListener('input', updatePreview);
document.getElementById('clearButton').addEventListener('click', clearAllObjects);

// Function to clear all objects from the scene and the physics world
function clearAllObjects() {
    objects.forEach(obj => {
        scene.remove(obj.mesh);
        world.removeBody(obj.body);
    });
    objects = [];
}

// Function to check if the click is inside the GUI
function isClickInsideGUI(event) {
    const gui = document.getElementById('gui');
    const rect = gui.getBoundingClientRect();
    return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
    );
}

function updatePreview(event) {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(plane);
    if (intersects.length > 0) {
        const point = intersects[0].point;

        const shape = document.getElementById('shape').value;
        const size = parseFloat(document.getElementById('size').value);

        if (!previewObject || previewObject.userData.type !== shape || previewObject.userData.size !== size) {
            // Remove previous preview object
            if (previewObject) scene.remove(previewObject);

            // Create a new preview object
            previewObject = createPreviewObject(shape, size);
            previewObject.userData.type = shape;
            previewObject.userData.size = size;
            scene.add(previewObject);
        }

        const height = parseFloat(document.getElementById('height').value);
        previewObject.position.set(point.x, height, point.z);

        // Update the position of the preview marker (red 'X')
        if (!previewMarker) {
            previewMarker = createPreviewMarker();
            scene.add(previewMarker);
        }
        previewMarker.position.set(point.x, 0.01, point.z);
    }
}

// Function to create a preview object with low opacity
function createPreviewObject(type, size) {
    let geometry;
    switch (type) {
        case 'sphere':
            geometry = new THREE.SphereGeometry(size / 2, 32, 32);
            break;
        case 'cube':
            geometry = new THREE.BoxGeometry(size, size, size);
            break;
        case 'pyramid':
            geometry = new THREE.ConeGeometry(size / 2, size, 4);
            break;
    }
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    return new THREE.Mesh(geometry, material);
}

// Function to create a preview marker ('X' red)
function createPreviewMarker() {
    const markerGeometry = new THREE.Geometry();
    markerGeometry.vertices.push(new THREE.Vector3(-0.5, 0, 0), new THREE.Vector3(0.5, 0, 0));
    markerGeometry.vertices.push(new THREE.Vector3(0, 0, -0.5), new THREE.Vector3(0, 0, 0.5));
    const markerMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    return new THREE.LineSegments(markerGeometry, markerMaterial);
}

// Create object when clicking on the preview
document.addEventListener('click', (event) => {
    // Prevent creation if click is inside the GUI
    if (isClickInsideGUI(event)) return;

    if (previewObject) {
        const shape = document.getElementById('shape').value;
        const weight = parseFloat(document.getElementById('weight').value);
        const bounce = parseFloat(document.getElementById('bounce').value);
        const gravity = parseFloat(document.getElementById('gravity').value);
        const size = parseFloat(document.getElementById('size').value);
        const position = previewObject.position.clone();

        // Update gravity in the physics world
        world.gravity.set(0, gravity, 0);

        // Create the actual object and remove the preview
        createObjectAtPoint(shape, weight, bounce, size, position);
        scene.remove(previewObject);
        scene.remove(previewMarker);
        previewObject = null;
        previewMarker = null;
    }
});

// Function to create an object at a given point
function createObjectAtPoint(type, weight, bounceFactor, size, point) {
    let geometry, shape;

    // Create Three.js mesh
    switch (type) {
        case 'sphere':
            geometry = new THREE.SphereGeometry(size / 2, 32, 32);
            shape = new CANNON.Sphere(size / 2);
            break;
        case 'cube':
            geometry = new THREE.BoxGeometry(size, size, size);
            shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
            break;
        case 'pyramid':
            geometry = new THREE.ConeGeometry(size / 2, size, 4);
            shape = new CANNON.Cylinder(0, size / 2, size, 4);
            break;
    }

    const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.position.copy(point);
    scene.add(mesh);

    // Create a corresponding Cannon.js body
    const body = new CANNON.Body({
        mass: weight,
        shape: shape,
        position: new CANNON.Vec3(point.x, point.y, point.z),
        material: new CANNON.Material({ restitution: bounceFactor })
    });

    // Adjust material contact properties
    const contactMaterial = new CANNON.ContactMaterial(
        groundMaterial,
        body.material,
        {
            restitution: bounceFactor, // Controls how bouncy the object is
            friction: 0.5, // Controls friction between the object and the ground
        }
    );
    world.addContactMaterial(contactMaterial);

    body.linearDamping = 0.1; // Reduce speed over time for a more realistic stop
    body.angularDamping = 0.1; // Reduce rotation speed for a more realistic behavior
    world.addBody(body);

    objects.push({ mesh, body });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Step the physics world
    world.step(1 / 60);

    // Update each object's Three.js mesh position based on its Cannon.js body
    objects.forEach((obj) => {
        obj.mesh.position.copy(obj.body.position);
        obj.mesh.quaternion.copy(obj.body.quaternion);
    });

    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

animate();


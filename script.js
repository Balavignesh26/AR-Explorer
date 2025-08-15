// Check if Three.js libraries are loaded
if (typeof THREE === 'undefined') {
    console.error('Three.js library not loaded!');
    document.body.innerHTML = '<div style="text-align: center; padding: 50px; color: red;"><h1>Error: Three.js library not loaded</h1><p>Please check that the library files are properly loaded.</p></div>';
} else {
    console.log('Three.js loaded successfully, version:', THREE.REVISION);
}

const GOOGLE_API_KEY = 'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg'; // Free API key for development

// Global variables
let currentScene = null;
let currentRenderer = null;
let currentCamera = null;
let currentControls = null;

// Tab functionality
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            // Add active class to clicked button and target content
            button.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-tab`);
            targetContent.classList.add('active');
            targetContent.style.display = 'block';
            
            // Show feedback form
            document.getElementById('feedback-form').style.display = 'block';
            
            // If AR tab is clicked, handle 3D model loading
            if (targetTab === 'ar') {
                const landmarkName = document.getElementById('landmark-name-wiki').innerText;
                if (landmarkName) {
                setTimeout(() => {
                        handle3DModelLoading(landmarkName);
                }, 100);
                }
            }
        });
    });
}

// Handle 3D model loading based on landmark
function handle3DModelLoading(landmarkName) {
    const arPreview = document.getElementById('ar-preview');
    const fbxViewer = document.getElementById('fbx-viewer');
    const arInstructions = document.getElementById('ar-instructions');

    // Hide all containers initially
    arPreview.style.display = 'none';
    fbxViewer.style.display = 'none';
    arInstructions.style.display = 'none';

    // Check if it's Taj Mahal
    if (landmarkName.toLowerCase().includes('taj mahal')) {
        // Show Three.js viewer for Taj Mahal
        fbxViewer.style.display = 'block';
        init3DViewerWithSimpleModel('fbx-viewer');
    } else {
        // Show "3D Model not available" message
        arInstructions.style.display = 'block';
        arInstructions.innerHTML = `
                <h3>🏛️ 3D AR Experience</h3>
                <p>3D Model not available for "${landmarkName}"</p>
                <div style="background: rgba(255, 165, 0, 0.1); border: 2px solid #FFA500; border-radius: 10px; padding: 20px; margin: 20px 0;">
                    <p style="color: #FFA500; font-weight: 600; margin: 0;">⚠️ 3D Model Not Available</p>
                    <p style="color: #FFFFFF; margin: 10px 0 0 0; font-size: 14px;">Currently, only Taj Mahal has an interactive 3D model available.</p>
                </div>
                <div class="ar-features">
                    <div class="ar-feature">
                        <span class="feature-icon">🔍</span>
                        <span>Search for Taj Mahal</span>
                    </div>
                    <div class="ar-feature">
                        <span class="feature-icon">🏛️</span>
                        <span>View Interactive 3D</span>
                    </div>
                    <div class="ar-feature">
                        <span class="feature-icon">🎯</span>
                        <span>Explore in Detail</span>
                    </div>
                </div>
            `;
    }
}

// Enhanced Dark Mode
function initEnhancedDarkMode() {
    const darkModeSwitch = document.getElementById('dark-mode-switch');
    const body = document.body;
    
    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        body.classList.add('dark-mode');
        darkModeSwitch.checked = true;
    }
    
    // Enhanced dark mode toggle
    darkModeSwitch.addEventListener('change', () => {
        if (darkModeSwitch.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
            showNotification('🌙 Dark mode enabled', 'success');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'false');
            showNotification('☀️ Light mode enabled', 'success');
        }
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Show/Hide Welcome Message
function showWelcomeMessage() {
    document.getElementById('welcome-message').style.display = 'block';
    document.getElementById('info-container').style.display = 'none';
}

function hideWelcomeMessage() {
    document.getElementById('welcome-message').style.display = 'none';
}

// Enhanced 3D Model Viewer
function init3DViewer(modelPath, containerId) {
    console.log('Initializing 3D viewer with path:', modelPath);
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('3D viewer container not found!');
        return;
    }
    
    // Clear previous scene
    if (currentScene) {
        container.removeChild(currentRenderer.domElement);
        currentScene = null;
        currentRenderer = null;
        currentCamera = null;
        currentControls = null;
    }
    
    container.innerHTML = '';
    
    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = `
        <div class="spinner"></div>
        <p>Loading 3D Model...</p>
        <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
        </div>
    `;
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.padding = '20px';
    container.appendChild(loadingDiv);
    
    // Create Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    container.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add point light for better illumination
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-100, 100, -100);
    scene.add(pointLight);
    
    // Camera position
    camera.position.set(0, 50, 100);
    
    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    
    // Try to load the model
    load3DModel(modelPath, scene, loadingDiv, container, renderer, camera, controls);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    
    // Store references
    currentScene = scene;
    currentRenderer = renderer;
    currentCamera = camera;
    currentControls = controls;
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

// Load 3D Model with multiple format support
function load3DModel(modelPath, scene, loadingDiv, container, renderer, camera, controls) {
    const progressFill = loadingDiv.querySelector('.progress-fill');
    
    // Try different model formats
    const modelFormats = [
        { path: modelPath.replace('.fbx', '.glb'), loader: 'gltf', type: 'GLB' },
        { path: modelPath.replace('.fbx', '.gltf'), loader: 'gltf', type: 'GLTF' },
        { path: modelPath, loader: 'fbx', type: 'FBX' }
    ];
    
    let currentFormatIndex = 0;
    
    function tryNextFormat() {
        if (currentFormatIndex >= modelFormats.length) {
            // All formats failed, show fallback
            showFallbackModel(scene, loadingDiv, container, renderer, camera, controls);
            return;
        }
        
        const format = modelFormats[currentFormatIndex];
        console.log(`Trying ${format.type} format:`, format.path);
        
        // Test if file exists
        fetch(format.path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response;
            })
            .then(() => {
                // File exists, try to load
                loadModelWithLoader(format, scene, loadingDiv, container, renderer, camera, controls);
            })
            .catch(error => {
                console.log(`${format.type} format not available:`, error.message);
                currentFormatIndex++;
                tryNextFormat();
            });
    }
    
    tryNextFormat();
}

// Load model with specific loader
function loadModelWithLoader(format, scene, loadingDiv, container, renderer, camera, controls) {
    const progressFill = loadingDiv.querySelector('.progress-fill');
    
    try {
        let loader;
        
        if (format.loader === 'gltf') {
            if (typeof THREE.GLTFLoader === 'undefined') {
                throw new Error('GLTFLoader not available');
            }
            loader = new THREE.GLTFLoader();
        } else if (format.loader === 'fbx') {
            if (typeof THREE.FBXLoader === 'undefined') {
                throw new Error('FBXLoader not available');
            }
            loader = new THREE.FBXLoader();
        }
        
        progressFill.style.width = '30%';
        
        loader.load(
            format.path,
            function (object) {
                console.log(`${format.type} model loaded successfully:`, object);
                
                let model;
                if (format.loader === 'gltf') {
                    model = object.scene;
                } else {
                    model = object;
                }
                
                // Center and scale the model
                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                model.position.sub(center);
                
                // Scale model to fit in view
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 50 / maxDim;
                model.scale.setScalar(scale);
                
                scene.add(model);
                
                // Position camera
                camera.position.set(0, 30, 80);
                camera.lookAt(0, 0, 0);
                controls.update();
                
                // Remove loading indicator
                progressFill.style.width = '100%';
                setTimeout(() => {
                    container.removeChild(loadingDiv);
                }, 500);
                
                showNotification(`🎭 ${format.type} model loaded successfully!`, 'success');
            },
            function (progress) {
                const percent = (progress.loaded / progress.total * 100);
                progressFill.style.width = (30 + percent * 0.7) + '%';
            },
            function (error) {
                console.error(`Error loading ${format.type} model:`, error);
                currentFormatIndex++;
                tryNextFormat();
            }
        );
    } catch (error) {
        console.error(`Loader error for ${format.type}:`, error);
        currentFormatIndex++;
        tryNextFormat();
    }
}

// Fallback model when all formats fail
function showFallbackModel(scene, loadingDiv, container, renderer, camera, controls) {
    console.log('Showing fallback model');
    
    // Create a simple architectural structure
    const group = new THREE.Group();
    
    // Base platform
    const baseGeometry = new THREE.BoxGeometry(40, 2, 40);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1;
    group.add(base);
    
    // Central tower
    const towerGeometry = new THREE.BoxGeometry(8, 30, 8);
    const towerMaterial = new THREE.MeshLambertMaterial({ color: 0xCD853F });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 15;
    group.add(tower);
    
    // Four arches around the tower
    const archGeometry = new THREE.TorusGeometry(6, 1, 8, 16, Math.PI);
    const archMaterial = new THREE.MeshLambertMaterial({ color: 0xDAA520 });
    
    for (let i = 0; i < 4; i++) {
        const arch = new THREE.Mesh(archGeometry, archMaterial);
        arch.rotation.x = Math.PI / 2;
        arch.rotation.y = (i * Math.PI) / 2;
        arch.position.y = 5;
        group.add(arch);
    }
    
    // Add decorative elements
    const sphereGeometry = new THREE.SphereGeometry(1, 8, 6);
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
    
    for (let i = 0; i < 4; i++) {
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(
            Math.cos(i * Math.PI / 2) * 20,
            8,
            Math.sin(i * Math.PI / 2) * 20
        );
        group.add(sphere);
    }
    
    scene.add(group);
    
    // Position camera
    camera.position.set(0, 40, 80);
    camera.lookAt(0, 0, 0);
    controls.update();
    
    // Remove loading indicator
    container.removeChild(loadingDiv);
    
    // Add info message
    const infoMsg = document.createElement('div');
    infoMsg.innerHTML = `
        <div style="text-align: center; padding: 20px; background: rgba(255, 165, 0, 0.1); border-radius: 10px; border: 2px solid #FFA500;">
            <p style="color: #FFA500; font-weight: 600; margin: 0;">🎭 Fallback 3D Model Displayed</p>
            <p style="color: #FFFFFF; margin: 10px 0 0 0; font-size: 14px;">Original model couldn't be loaded, showing architectural representation</p>
        </div>
    `;
    container.appendChild(infoMsg);
    
    showNotification('🎭 Fallback 3D model displayed', 'info');
}

// Create a high-quality, detailed Taj Mahal 3D model similar to Sketchfab
function createTajMahalModel(scene) {
    const group = new THREE.Group();
    
    // Create ultra-high-quality materials with realistic properties
    const whiteMarbleMaterial = new THREE.MeshPhongMaterial({
        color: 0xF8F8FF,
        shininess: 150,
        specular: 0x666666,
        emissive: 0x111111
    });

    const redSandstoneMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        shininess: 50,
        specular: 0x333333
    });

    const goldMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFD700,
        shininess: 300,
        specular: 0xFFFFFF,
        emissive: 0x333333
    });

    const blackMarbleMaterial = new THREE.MeshPhongMaterial({
        color: 0x2F2F2F,
        shininess: 200,
        specular: 0x555555
    });

    // Main platform (red sandstone base)
    const mainPlatformGeometry = new THREE.BoxGeometry(120, 8, 120, 20, 4, 20);
    const mainPlatform = new THREE.Mesh(mainPlatformGeometry, redSandstoneMaterial);
    mainPlatform.position.y = -4;
    group.add(mainPlatform);

    // White marble platform
    const marblePlatformGeometry = new THREE.BoxGeometry(100, 6, 100, 16, 3, 16);
    const marblePlatform = new THREE.Mesh(marblePlatformGeometry, whiteMarbleMaterial);
    marblePlatform.position.y = 1;
    group.add(marblePlatform);

    // Central mausoleum base
    const mausoleumBaseGeometry = new THREE.BoxGeometry(70, 12, 70, 14, 6, 14);
    const mausoleumBase = new THREE.Mesh(mausoleumBaseGeometry, whiteMarbleMaterial);
    mausoleumBase.position.y = 10;
    group.add(mausoleumBase);

    // Main dome structure (central chamber)
    const centralChamberGeometry = new THREE.BoxGeometry(40, 25, 40, 16, 12, 16);
    const centralChamber = new THREE.Mesh(centralChamberGeometry, whiteMarbleMaterial);
    centralChamber.position.y = 32.5;
    group.add(centralChamber);

    // Main dome (the iconic onion dome)
    const mainDomeGeometry = new THREE.SphereGeometry(18, 64, 48, 0, Math.PI);
    const mainDome = new THREE.Mesh(mainDomeGeometry, whiteMarbleMaterial);
    mainDome.position.y = 65;
    group.add(mainDome);

    // Dome finial (golden spire)
    const finialGeometry = new THREE.ConeGeometry(2, 8, 16);
    const finial = new THREE.Mesh(finialGeometry, goldMaterial);
    finial.position.y = 75;
    group.add(finial);

    // Dome base ring (decorative)
    const domeBaseGeometry = new THREE.TorusGeometry(18, 1.5, 16, 64);
    const domeBase = new THREE.Mesh(domeBaseGeometry, goldMaterial);
    domeBase.rotation.x = Math.PI / 2;
    domeBase.position.y = 65;
    group.add(domeBase);

    // Four minarets at corners
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const radius = 45;

        // Minaret base
        const minaretBaseGeometry = new THREE.CylinderGeometry(3, 3, 8, 20);
        const minaretBase = new THREE.Mesh(minaretBaseGeometry, whiteMarbleMaterial);
        minaretBase.position.set(
            Math.cos(angle) * radius,
            10,
            Math.sin(angle) * radius
        );
        group.add(minaretBase);

        // Minaret main body
        const minaretGeometry = new THREE.CylinderGeometry(2.5, 2.5, 50, 24);
        const minaret = new THREE.Mesh(minaretGeometry, whiteMarbleMaterial);
        minaret.position.set(
            Math.cos(angle) * radius,
            35,
            Math.sin(angle) * radius
        );
        group.add(minaret);

        // Minaret decorative bands (8 levels)
        for (let j = 0; j < 8; j++) {
            const bandGeometry = new THREE.TorusGeometry(2.7, 0.4, 8, 20);
            const band = new THREE.Mesh(bandGeometry, goldMaterial);
            band.rotation.x = Math.PI / 2;
            band.position.set(
                Math.cos(angle) * radius,
                15 + j * 6,
                Math.sin(angle) * radius
            );
            group.add(band);
        }

        // Minaret top dome
        const minaretDomeGeometry = new THREE.SphereGeometry(3, 16, 12, 0, Math.PI);
        const minaretDome = new THREE.Mesh(minaretDomeGeometry, whiteMarbleMaterial);
        minaretDome.position.set(
            Math.cos(angle) * radius,
            60,
            Math.sin(angle) * radius
        );
        group.add(minaretDome);

        // Minaret finial
        const minaretFinialGeometry = new THREE.ConeGeometry(0.8, 3, 12);
        const minaretFinial = new THREE.Mesh(minaretFinialGeometry, goldMaterial);
        minaretFinial.position.set(
            Math.cos(angle) * radius,
            64,
            Math.sin(angle) * radius
        );
        group.add(minaretFinial);
    }

    // Four smaller domes around the main dome
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const radius = 25;

        // Small dome base
        const smallDomeBaseGeometry = new THREE.CylinderGeometry(6, 6, 4, 16);
        const smallDomeBase = new THREE.Mesh(smallDomeBaseGeometry, whiteMarbleMaterial);
        smallDomeBase.position.set(
            Math.cos(angle) * radius,
            45,
            Math.sin(angle) * radius
        );
        group.add(smallDomeBase);

        // Small dome
        const smallDomeGeometry = new THREE.SphereGeometry(6, 24, 18, 0, Math.PI);
        const smallDome = new THREE.Mesh(smallDomeGeometry, whiteMarbleMaterial);
        smallDome.position.set(
            Math.cos(angle) * radius,
            52,
            Math.sin(angle) * radius
        );
        group.add(smallDome);

        // Small dome finial
        const smallFinialGeometry = new THREE.ConeGeometry(1, 2, 8);
        const smallFinial = new THREE.Mesh(smallFinialGeometry, goldMaterial);
        smallFinial.position.set(
            Math.cos(angle) * radius,
            55,
            Math.sin(angle) * radius
        );
        group.add(smallFinial);
    }

    // Main entrance arch (iwans)
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;

        // Arch structure
        const archGeometry = new THREE.TorusGeometry(12, 3, 16, 32, Math.PI);
        const arch = new THREE.Mesh(archGeometry, whiteMarbleMaterial);
        arch.rotation.x = Math.PI / 2;
        arch.rotation.y = angle;
        arch.position.y = 25;
        group.add(arch);

        // Arch decorative frame
        const archFrameGeometry = new THREE.TorusGeometry(12.5, 1, 8, 16, Math.PI);
        const archFrame = new THREE.Mesh(archFrameGeometry, goldMaterial);
        archFrame.rotation.x = Math.PI / 2;
        archFrame.rotation.y = angle;
        archFrame.position.y = 25;
        group.add(archFrame);

        // Arch keystone
        const keystoneGeometry = new THREE.BoxGeometry(2, 1, 2);
        const keystone = new THREE.Mesh(keystoneGeometry, goldMaterial);
        keystone.position.set(
            Math.cos(angle) * 12,
            25,
            Math.sin(angle) * 12
        );
        group.add(keystone);
    }

    // Decorative panels and calligraphy
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const radius = 35;

        // Decorative panels
        const panelGeometry = new THREE.BoxGeometry(4, 3, 0.3);
        const panel = new THREE.Mesh(panelGeometry, blackMarbleMaterial);
        panel.position.set(
            Math.cos(angle) * radius,
            20,
            Math.sin(angle) * radius
        );
        panel.rotation.y = angle;
        group.add(panel);

        // Calligraphy frames
        const calligraphyGeometry = new THREE.BoxGeometry(3, 2, 0.1);
        const calligraphy = new THREE.Mesh(calligraphyGeometry, goldMaterial);
        calligraphy.position.set(
            Math.cos(angle) * radius,
            20,
            Math.sin(angle) * radius
        );
        calligraphy.rotation.y = angle;
        group.add(calligraphy);
    }

    // Windows and openings
    for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;

        // Main windows
        const windowGeometry = new THREE.BoxGeometry(3, 5, 0.5);
        const window = new THREE.Mesh(windowGeometry, blackMarbleMaterial);
        window.position.set(
            Math.cos(angle) * 20,
            32.5,
            Math.sin(angle) * 20
        );
        window.rotation.y = angle;
        group.add(window);

        // Window frames
        const windowFrameGeometry = new THREE.BoxGeometry(3.5, 5.5, 0.2);
        const windowFrame = new THREE.Mesh(windowFrameGeometry, goldMaterial);
        windowFrame.position.set(
            Math.cos(angle) * 20,
            32.5,
            Math.sin(angle) * 20
        );
        windowFrame.rotation.y = angle;
        group.add(windowFrame);
    }

    // Decorative elements around the base
    for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI) / 8;
        const radius = 50;

        // Decorative spheres
        const sphereGeometry = new THREE.SphereGeometry(1.2, 12, 8);
        const sphere = new THREE.Mesh(sphereGeometry, goldMaterial);
        sphere.position.set(
            Math.cos(angle) * radius,
            4,
            Math.sin(angle) * radius
        );
        group.add(sphere);

        // Decorative pillars
        const pillarGeometry = new THREE.CylinderGeometry(1, 1, 6, 12);
        const pillar = new THREE.Mesh(pillarGeometry, whiteMarbleMaterial);
        pillar.position.set(
            Math.cos(angle) * (radius + 8),
            3,
            Math.sin(angle) * (radius + 8)
        );
        group.add(pillar);
    }

    // Reflecting pool effect (ground plane)
    const poolGeometry = new THREE.PlaneGeometry(200, 200, 32, 32);
    const poolMaterial = new THREE.MeshPhongMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.3,
        shininess: 100,
        specular: 0x444444
    });
    const pool = new THREE.Mesh(poolGeometry, poolMaterial);
    pool.rotation.x = -Math.PI / 2;
    pool.position.y = -8;
    group.add(pool);
    
    return group;
}

// Initialize 3D viewer with high-quality Taj Mahal model similar to Sketchfab
function init3DViewerWithSimpleModel(containerId) {
    console.log('Initializing 3D viewer with high-quality Taj Mahal model');
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('3D viewer container not found!');
        return;
    }

    // Clean up previous 3D scene if exists
    if (container.cleanup) {
        container.cleanup();
    }
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create Three.js scene with high-quality settings
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true
    });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    renderer.setClearColor(0x87CEEB, 0.1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    container.appendChild(renderer.domElement);
    
    // Ultra-high-quality lighting setup for Taj Mahal
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    scene.add(ambientLight);
    
    // Main directional light (sun) - golden hour effect
    const sunLight = new THREE.DirectionalLight(0xfff4e6, 1.5);
    sunLight.position.set(120, 180, 120);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 8192;
    sunLight.shadow.mapSize.height = 8192;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 800;
    sunLight.shadow.camera.left = -150;
    sunLight.shadow.camera.right = 150;
    sunLight.shadow.camera.top = 150;
    sunLight.shadow.camera.bottom = -150;
    sunLight.shadow.bias = -0.00005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    // Fill light for balanced illumination
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-80, 120, -80);
    scene.add(fillLight);

    // Rim light for architectural definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(0, 80, -150);
    scene.add(rimLight);

    // Warm accent lights for golden hour effect
    const accentLight1 = new THREE.PointLight(0xffd700, 0.6, 300);
    accentLight1.position.set(100, 60, 100);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0xffd700, 0.5, 300);
    accentLight2.position.set(-100, 60, -100);
    scene.add(accentLight2);

    // Additional atmospheric lighting
    const atmosphericLight = new THREE.PointLight(0x87CEEB, 0.3, 400);
    atmosphericLight.position.set(0, 100, 0);
    scene.add(atmosphericLight);

    // Ground reflection lighting
    const groundLight = new THREE.PointLight(0x87CEEB, 0.2, 200);
    groundLight.position.set(0, 20, 0);
    scene.add(groundLight);

    // Camera setup for optimal Taj Mahal viewing
    camera.position.set(150, 100, 150);
    camera.lookAt(0, 40, 0);

    // Enhanced controls with smooth behavior
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.minDistance = 50;
    controls.maxDistance = 300;
    controls.maxPolarAngle = Math.PI / 2;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;

    // Create and add the high-quality Taj Mahal model
    const tajMahalModel = createTajMahalModel(scene);
    tajMahalModel.castShadow = true;
    tajMahalModel.receiveShadow = true;
    scene.add(tajMahalModel);

    // Enhanced ground plane for Taj Mahal
    const groundGeometry = new THREE.PlaneGeometry(600, 600, 64, 64);
    const groundMaterial = new THREE.MeshLambertMaterial({
        color: 0x90EE90,
        transparent: true,
        opacity: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -8;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Professional skybox for Taj Mahal
    const skyGeometry = new THREE.SphereGeometry(1000, 128, 128);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.15
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    // Add atmospheric fog for depth and realism
    scene.fog = new THREE.Fog(0x87CEEB, 300, 1000);

    // Success message with professional styling
    const successMsg = document.createElement('div');
    successMsg.innerHTML = `
        <div style="position: absolute; top: 10px; left: 10px; right: 10px; z-index: 1000; text-align: center;">
            <div style="background: linear-gradient(135deg, rgba(76, 175, 80, 0.95), rgba(40, 167, 69, 0.95)); color: white; padding: 15px; border-radius: 15px; font-weight: 600; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                🏛️ High-Quality Taj Mahal 3D Model Loaded!
            </div>
            <div style="background: rgba(0, 0, 0, 0.8); color: white; padding: 10px; border-radius: 10px; margin-top: 8px; font-size: 14px; backdrop-filter: blur(5px);">
                🖱️ Mouse: Rotate & Zoom | 📱 Touch: Swipe & Pinch | 🎯 Right-click: Pan | 🔄 Auto-rotate available
            </div>
        </div>
    `;
    container.appendChild(successMsg);
    
    // Remove success message after 12 seconds
    setTimeout(() => {
        if (container.contains(successMsg)) {
            container.removeChild(successMsg);
        }
    }, 12000);

    // High-performance animation loop with frame rate optimization
    let time = 0;
    let frameCount = 0;
    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    function animate(currentTime) {
        requestAnimationFrame(animate);
        
        // Limit frame rate for better performance
        if (currentTime - lastTime < frameInterval) {
            return;
        }
        lastTime = currentTime;
        
        time += 0.01;
        frameCount++;

        // Smooth camera movement
        if (frameCount < 180) { // First 3 seconds
            const progress = frameCount / 180;
            camera.position.lerp(new THREE.Vector3(120, 80, 120), 0.02);
            camera.lookAt(0, 30, 0);
        }

        // Gentle model animation
        tajMahalModel.rotation.y = Math.sin(time * 0.3) * 0.05;

        // Update controls
        controls.update();

        // Render with high quality
        renderer.render(scene, camera);
    }

    animate();
    
    // Responsive resize handler
    const resizeHandler = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    window.addEventListener('resize', resizeHandler);
    
    // Cleanup function to prevent memory leaks
    const cleanup = () => {
        window.removeEventListener('resize', resizeHandler);
        if (renderer) {
            renderer.dispose();
        }
        if (scene) {
            scene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
    };
    
    // Store cleanup function for later use
    container.cleanup = cleanup;

    // Add auto-rotate toggle
    const autoRotateBtn = document.createElement('button');
    autoRotateBtn.innerHTML = '🔄 Auto-Rotate';
    autoRotateBtn.style.cssText = `
        position: absolute;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        background: rgba(102, 126, 234, 0.9);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.3s ease;
    `;

    autoRotateBtn.addEventListener('click', () => {
        controls.autoRotate = !controls.autoRotate;
        autoRotateBtn.style.background = controls.autoRotate ?
            'rgba(76, 175, 80, 0.9)' : 'rgba(102, 126, 234, 0.9)';
        autoRotateBtn.innerHTML = controls.autoRotate ? '⏸️ Stop Rotation' : '🔄 Auto-Rotate';
    });

    container.appendChild(autoRotateBtn);

    showNotification('Taj Mahal', '3D Model');
}

// Display cached data function
function displayCachedData(data) {
    const { wikiData } = data;
    
    // Hide welcome message and show content
    hideWelcomeMessage();
    
    // Update Wikipedia info
    document.getElementById('landmark-name-wiki').innerText = wikiData.title;
    document.getElementById('thumbnail').src = wikiData.thumbnail ? wikiData.thumbnail.source : 'placeholder.jpg';
    document.getElementById('landmark-summary-wiki').innerText = wikiData.extract;
    
    // Optimize gallery - show only actual images (max 2)
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear gallery
    
    // Add main thumbnail to gallery if available
    if (wikiData.thumbnail && wikiData.thumbnail.source) {
        const mainImage = document.createElement('img');
        mainImage.src = wikiData.thumbnail.source;
        mainImage.alt = wikiData.title;
        mainImage.onclick = () => openImageModal(wikiData.thumbnail.source);
        gallery.appendChild(mainImage);
    }
    
    // Show gallery only if images are available
    if (gallery.children.length > 0) {
        gallery.hidden = false;
    } else {
        gallery.hidden = true;
    }
    
    // Update location details
    if (wikiData.coordinates) {
        const lat = wikiData.coordinates.lat;
        const lon = wikiData.coordinates.lon;
        document.getElementById('coordinates').innerText = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        
        // Update map
        try {
            const mapPreview = document.getElementById('map-preview');
            mapPreview.src = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_API_KEY}&q=${encodeURIComponent(wikiData.title)}&zoom=15`;
        } catch (mapError) {
            console.warn('Map loading error:', mapError);
        }
    }
    
    // Update region info
    if (wikiData.lang) {
        document.getElementById('region-info').innerText = `Content language: ${wikiData.lang}`;
    }
    
    // Show info container and set up tabs
    document.getElementById('info-container').style.display = 'block';
    document.getElementById('info-tab').style.display = 'block';
    document.getElementById('ar-tab').style.display = 'none';
    
    // Set info tab as active
    document.querySelector('[data-tab="info"]').classList.add('active');
    document.querySelector('[data-tab="ar"]').classList.remove('active');
    
    // Show feedback form
    document.getElementById('feedback-form').style.display = 'block';
    
    // Check if it's Taj Mahal for 3D model and fix location
    if (wikiData.title.toLowerCase().includes('taj mahal')) {
        if (wikiData.title.toLowerCase().includes('guntur')) {
            document.getElementById('coordinates').innerText = '27.1751, 78.0421';
            document.getElementById('weather-info').innerText = 'Weather data for Agra, India';
            
            try {
                const mapIframe = document.getElementById('map-preview');
                mapIframe.src = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_API_KEY}&q=Taj+Mahal+Agra+India&zoom=15`;
            } catch (error) {
                console.warn('Map update failed:', error);
            }
        }
        showNotification('Click "3D AR Model" tab to view the interactive 3D model.', 'info');
    }
    
    showNotification('✅ Cached data loaded successfully!', 'success');
}

// Image Modal Function for Gallery
function openImageModal(imageSrc) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100000;
        cursor: pointer;
    `;
    
    // Create image element
    const img = document.createElement('img');
    img.src = imageSrc;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    `;
    
    // Add close functionality
    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.appendChild(img);
    document.body.appendChild(modal);
}

// Cache for API responses to improve performance
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Main landmark data fetching function with caching
async function fetchLandmarkData(location) {
    console.log('Fetching data for:', location);
    
    // Check cache first
    const cacheKey = `landmark_${location.toLowerCase()}`;
    const cachedData = apiCache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
        console.log('Using cached data for:', location);
        displayCachedData(cachedData.data);
        return;
    }
    
    // Hide welcome message and show content
    hideWelcomeMessage();
    
    // Show loading
    const loading = document.getElementById('loading-animation');
    loading.hidden = false;
    
    const error = document.getElementById('error-message');
    const infoContainer = document.getElementById('info-container');

    error.hidden = true;

    try {
        // Fetch Wikipedia data
        const wikiResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${location}`);
        
        if (!wikiResponse.ok) {
            if (wikiResponse.status === 404) {
                throw new Error(`Landmark "${location}" not found. Please try a different search term.`);
            } else {
                throw new Error(`Wikipedia API error: ${wikiResponse.status}`);
            }
        }
        
        const wikiData = await wikiResponse.json();

        // Update Wikipedia info
        document.getElementById('landmark-name-wiki').innerText = wikiData.title;
        document.getElementById('thumbnail').src = wikiData.thumbnail ? wikiData.thumbnail.source : 'placeholder.jpg';
        document.getElementById('landmark-summary-wiki').innerText = wikiData.extract;
        
        // Optimize gallery - show only actual images (max 2)
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = ''; // Clear gallery
        
        // Add main thumbnail to gallery if available
        if (wikiData.thumbnail && wikiData.thumbnail.source) {
            const mainImage = document.createElement('img');
            mainImage.src = wikiData.thumbnail.source;
            mainImage.alt = wikiData.title;
            mainImage.onclick = () => openImageModal(wikiData.thumbnail.source);
            gallery.appendChild(mainImage);
        }
        
        // Try to get one additional image from Wikipedia API
        if (wikiData.pageid) {
            try {
                fetch(`https://en.wikipedia.org/api/rest_v1/page/media/${encodeURIComponent(wikiData.title)}`)
                    .then(response => {
                        if (response.ok) return response.json();
                        throw new Error('No additional images');
                    })
                    .then(mediaData => {
                        if (mediaData.items && mediaData.items.length > 0) {
                            // Add only 1 additional image (total max 2)
                            const additionalImage = mediaData.items[0];
                            if (additionalImage.srcset && additionalImage.srcset.length > 0) {
                                const img = document.createElement('img');
                                img.src = additionalImage.srcset[0].src;
                                img.alt = additionalImage.title || wikiData.title;
                                img.onclick = () => openImageModal(additionalImage.srcset[0].src);
                                gallery.appendChild(img);
                            }
                        }
                    })
                    .catch(error => {
                        console.log('Gallery optimization: No additional images available');
                    });
            } catch (error) {
                console.log('Gallery optimization completed');
            }
        }
        
        // Show gallery only if images are available
        if (gallery.children.length > 0) {
            gallery.hidden = false;
        } else {
            gallery.hidden = true;
        }

        // Update location details
        if (wikiData.coordinates) {
            const lat = wikiData.coordinates.lat;
            const lon = wikiData.coordinates.lon;
            
            document.getElementById('coordinates').innerText = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
            
            // Get weather data with timeout and error handling
            try {
                const weatherPromise = fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Weather API timeout')), 5000)
                );
                
                const weatherResponse = await Promise.race([weatherPromise, timeoutPromise]);
                
                if (weatherResponse.ok) {
                    const weatherData = await weatherResponse.json();
                    const current = weatherData.current;
                    
                    const weatherDescriptions = {
                        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
                        45: "Foggy", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
                        55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
                        71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 95: "Thunderstorm"
                    };
                    
                    const weatherDesc = weatherDescriptions[current.weather_code] || "Unknown";
                    document.getElementById('weather-info').innerText = `${weatherDesc}, ${current.temperature_2m}°C, ${current.relative_humidity_2m}% humidity`;
                } else {
                    throw new Error('Weather API error');
                }
            } catch (weatherError) {
                console.warn('Weather data unavailable:', weatherError);
                document.getElementById('weather-info').innerText = 'Weather data unavailable';
            }
            
            // Update map with proper error handling
            try {
            const mapPreview = document.getElementById('map-preview');
            mapPreview.src = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_API_KEY}&q=${encodeURIComponent(wikiData.title)}&zoom=15`;
            } catch (mapError) {
                console.warn('Map loading error:', mapError);
                document.getElementById('map-container').innerHTML = '<p style="color: #ff6b6b; text-align: center; padding: 20px;">Map preview unavailable</p>';
            }
        }
        
        // Update region info
        if (wikiData.lang) {
            document.getElementById('region-info').innerText = `Content language: ${wikiData.lang}`;
        }
        
        // Show info container and set up tabs
        infoContainer.style.display = 'block';
        document.getElementById('info-tab').style.display = 'block';
        document.getElementById('ar-tab').style.display = 'none';
        
        // Set info tab as active
        document.querySelector('[data-tab="info"]').classList.add('active');
        document.querySelector('[data-tab="ar"]').classList.remove('active');
        
        // Show feedback form
        document.getElementById('feedback-form').style.display = 'block';
        
        // Check if it's Taj Mahal for 3D model and fix location
        if (wikiData.title.toLowerCase().includes('taj mahal')) {
            // Force correct location for Taj Mahal
            if (wikiData.title.toLowerCase().includes('guntur')) {
                // Override with correct Taj Mahal location
                document.getElementById('coordinates').innerText = '27.1751, 78.0421';
                document.getElementById('weather-info').innerText = 'Weather data for Agra, India';
                
                // Update map to show correct Taj Mahal location
                try {
                    const mapIframe = document.getElementById('map-preview');
                    mapIframe.src = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_API_KEY}&q=Taj+Mahal+Agra+India&zoom=15`;
                } catch (error) {
                    console.warn('Map update failed:', error);
                }
            }
            showNotification('Click "3D AR Model" tab to view the interactive 3D model.', 'info');
        }

        // Cache the successful response
        const dataToCache = {
            wikiData,
            timestamp: Date.now()
        };
        apiCache.set(cacheKey, dataToCache);
        
        loading.hidden = true;
        showNotification('✅ Landmark information loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error fetching data:', error);
        loading.hidden = true;
        
        // Show error and return to welcome
        showCreativeError(error.message);
        setTimeout(showWelcomeMessage, 3000);
    }
}

// Creative Error Handling
function showCreativeError(message) {
    const error = document.getElementById('error-message');
    const errorContent = error.querySelector('p');
    
    errorContent.innerHTML = `🚫 ${message}`;
    error.hidden = false;
    
    setTimeout(() => {
        error.hidden = true;
    }, 5000);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initEnhancedDarkMode();
    showWelcomeMessage();
    
    // Hamburger menu functionality
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const navMenu = document.getElementById('nav-menu');
    
    hamburgerIcon.addEventListener('click', () => {
        hamburgerIcon.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburgerIcon.contains(e.target) && !navMenu.contains(e.target)) {
            hamburgerIcon.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
    // Navigation functionality
    document.getElementById('login-btn').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Login functionality coming soon!');
        hamburgerIcon.classList.remove('active');
        navMenu.classList.remove('active');
    });
    
    document.getElementById('top-searches-btn').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Top searches functionality coming soon!');
        hamburgerIcon.classList.remove('active');
        navMenu.classList.remove('active');
    });
    
    document.getElementById('history-btn').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Search history functionality coming soon!');
        hamburgerIcon.classList.remove('active');
        navMenu.classList.remove('active');
    });
    
    // Debounce function for search optimization
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Search functionality with debouncing
    const debouncedSearch = debounce((location) => {
        if (location) {
            fetchLandmarkData(location);
        } else {
            showNotification('Please enter a landmark name', 'error');
        }
    }, 300);

    document.getElementById('search-button').addEventListener('click', () => {
        const location = document.getElementById('location-input').value.trim();
        debouncedSearch(location);
    });
    
    document.getElementById('explore-button').addEventListener('click', () => {
        const location = document.getElementById('location-select').value;
        if (location) {
            fetchLandmarkData(location);
        }
    });
    
    // Feedback form
    document.getElementById('feedback-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const feedback = document.getElementById('feedback-input').value;
        console.log('Feedback submitted:', feedback);
        showNotification('💬 Thank you for your feedback!', 'success');
        document.getElementById('feedback-form').reset();
    });
    
    // Enter key support for search
    document.getElementById('location-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('search-button').click();
        }
    });
});

// Check if Three.js libraries are loaded
if (typeof THREE === 'undefined') {
    console.error('Three.js library not loaded!');
    document.body.innerHTML = '<div style="text-align: center; padding: 50px; color: red;"><h1>Error: Three.js library not loaded</h1><p>Please check that the library files are properly loaded.</p></div>';
}

if (typeof THREE.FBXLoader === 'undefined') {
    console.error('FBXLoader not loaded!');
}

if (typeof THREE.OrbitControls === 'undefined') {
    console.error('OrbitControls not loaded!');
}

const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';

document.getElementById('search-button').addEventListener('click', () => {
    const location = document.getElementById('location-input').value.replace(' ', '_');
    fetchLandmarkData(location);
});

document.getElementById('explore-button').addEventListener('click', () => {
    const location = document.getElementById('location-select').value;
    fetchLandmarkData(location.replace(' ', '_'));
});

document.getElementById('view-charminar-ar').addEventListener('click', () => {
    // Directly show Charminar AR model
    document.getElementById('ar-preview').style.display = 'none';
    document.getElementById('fbx-viewer').style.display = 'block';
    initFBXViewer('../models/charminar.fbx');
});

document.getElementById('view-ar-button').addEventListener('click', () => {
    // Get the current landmark name from the displayed info
    const landmarkName = document.getElementById('landmark-name-wiki').innerText;
    
    if (landmarkName && landmarkName.toLowerCase().includes('charminar')) {
        // Hide model-viewer, show FBX viewer
        document.getElementById('ar-preview').style.display = 'none';
        document.getElementById('fbx-viewer').style.display = 'block';
        initFBXViewer('../models/charminar.fbx');
    } else {
        const arPreview = document.getElementById('ar-preview');
        if (arPreview.getAttribute('src')) {
            arPreview.enterAR();
        } else {
            alert('AR model not available yet.');
        }
    }
});

function initFBXViewer(fbxPath) {
    console.log('Initializing FBX viewer with path:', fbxPath);
    
    let container = document.getElementById('fbx-viewer');
    if (!container) {
        console.error('FBX viewer container not found!');
        return;
    }
    
    container.innerHTML = ''; // Clear previous scene if any

    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = '<div class="spinner"></div><p>Loading 3D Model...</p>';
    loadingDiv.style.textAlign = 'center';
    loadingDiv.style.padding = '20px';
    container.appendChild(loadingDiv);

    console.log('Creating Three.js scene...');
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 100, 300);

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x87CEEB); // Sky blue background
    container.appendChild(renderer.domElement);

    let controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add lights
    let ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    let directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 50);
    scene.add(directionalLight);

    console.log('Loading FBX file...');
    let loader = new THREE.FBXLoader();
    
    loader.load(
        fbxPath, 
        function (object) {
            console.log('FBX loaded successfully:', object);
            
            // Remove loading indicator
            container.removeChild(loadingDiv);
            
            // Center the model
            const box = new THREE.Box3().setFromObject(object);
            const center = box.getCenter(new THREE.Vector3());
            object.position.sub(center);
            
            // Scale the model appropriately - Charminar might be very large
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            let scale = 100 / maxDim; // Scale to fit in 100x100x100 box
            
            // If the model is very small, scale it up
            if (scale > 10) {
                scale = 10;
            }
            // If the model is very large, scale it down more
            if (scale < 0.01) {
                scale = 0.01;
            }
            
            object.scale.set(scale, scale, scale);
            
            scene.add(object);
            
            // Position camera to see the model
            camera.position.set(0, 50, 150);
            camera.lookAt(0, 0, 0);
            controls.update();
            
            // Add success message
            const successMsg = document.createElement('div');
            successMsg.innerHTML = '<p style="color: green; text-align: center; padding: 10px; background: rgba(0,255,0,0.1); border-radius: 5px;">Charminar 3D model loaded successfully! Use mouse to rotate, scroll to zoom.</p>';
            successMsg.style.cssText = 'position: absolute; top: 10px; left: 10px; right: 10px; z-index: 1000;';
            container.appendChild(successMsg);
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                if (container.contains(successMsg)) {
                    container.removeChild(successMsg);
                }
            }, 5000);
        },
        function (progress) {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        },
        function (error) {
            console.error('Error loading FBX:', error);
            container.removeChild(loadingDiv);
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: red;"><p>Error loading 3D model. Please check the console for details.</p></div>';
        }
    );

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}


document.getElementById('feedback-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const feedback = document.getElementById('feedback-input').value;
    console.log('Feedback submitted:', feedback);
    alert('Thank you for your feedback!');
    document.getElementById('feedback-form').reset();
    document.getElementById('feedback-form').hidden = true;
});

async function fetchLandmarkData(location) {
    const loading = document.getElementById('loading-animation');
    const error = document.getElementById('error-message');
    const infoContainer = document.getElementById('info-container');
    const arPreview = document.getElementById('ar-preview');
    const gallery = document.getElementById('gallery');
    const funFacts = document.getElementById('fun-facts');
    const mapPreview = document.getElementById('map-preview');

    loading.hidden = false;
    error.hidden = true;
    infoContainer.hidden = true;
    arPreview.hidden = true;
    gallery.hidden = true;
    funFacts.hidden = true;
    mapPreview.hidden = true;

    try {
        // Fetch from Wikipedia
        const wikiResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${location}`);
        const wikiData = await wikiResponse.json();

        // Update Wikipedia info
        document.getElementById('landmark-name-wiki').innerText = wikiData.title;
        document.getElementById('thumbnail').src = wikiData.thumbnail ? wikiData.thumbnail.source : 'placeholder.jpg';
        document.getElementById('landmark-summary-wiki').innerText = wikiData.extract;

        // Placeholder 3D model (replace with actual .glb/.glTF files)
        const modelMap = {
            'Eiffel_Tower': 'eiffel_tower.glb',
            'Charminar': 'charminar.glb',
            'Taj_Mahal': 'taj_mahal.glb'
        };
        arPreview.src = modelMap[location] || '';
        arPreview.hidden = !modelMap[location];

        // Gallery placeholder
        gallery.innerHTML = '';
        if (wikiData.originalimage) {
            const img1 = document.createElement('img');
            img1.src = wikiData.originalimage.source;
            img1.alt = `Gallery image 1 of ${wikiData.title}`;
            gallery.appendChild(img1);
        }
        gallery.hidden = !wikiData.originalimage;

        // Fun facts placeholder
        funFacts.innerText = `Fun Fact: ${wikiData.title} was built in ${new Date().getFullYear() - 100} (example).`;
        funFacts.hidden = false;

        // Fetch from Google Places
        const placeId = getPlaceId(location.replace('_', ' '));
        if (placeId) {
            const googleResponse = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${GOOGLE_API_KEY}`);
            const googleData = await googleResponse.json();

            if (googleData.result) {
                const googleResult = googleData.result;
                document.getElementById('landmark-name-google').innerText = googleResult.name;
                document.getElementById('landmark-rating-google').innerText = `Rating: ${googleResult.rating || 'N/A'}/5`;
                document.getElementById('user-reviews-google').innerText = googleResult.reviews && googleResult.reviews.length > 0 ? googleResult.reviews[0].text : 'No reviews available';
                mapPreview.src = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_API_KEY}&q=${encodeURIComponent(googleResult.name)}&zoom=15`;
                mapPreview.hidden = false;
            } else {
                document.getElementById('landmark-name-google').innerText = 'Not available';
                document.getElementById('landmark-rating-google').innerText = '';
                document.getElementById('user-reviews-google').innerText = '';
                mapPreview.hidden = true;
            }
        } else {
            document.getElementById('landmark-name-google').innerText = 'Not available';
            document.getElementById('landmark-rating-google').innerText = '';
            document.getElementById('user-reviews-google').innerText = '';
            mapPreview.hidden = true;
        }

        infoContainer.hidden = false;
    } catch (error) {
        console.error('Error fetching data:', error);
        error.hidden = false;
    } finally {
        loading.hidden = true;
    }
}

// Placeholder function to get Place ID
function getPlaceId(location) {
    const placeIds = {
        'Eiffel Tower': 'ChIJLU7jZClu5kcR4PcOOO6bYat',
        'Charminar': 'ChIJze8biHKeizsR5N0wFtjbWHQ',
        'Taj Mahal': 'ChIJ4dAFAaKlUjkRL6m9XUJXxdw'
    };
    return placeIds[location] || '';
}

// Show feedback form
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
        document.getElementById('feedback-form').hidden = false;
    });
});

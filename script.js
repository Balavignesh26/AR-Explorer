const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';

document.getElementById('search-button').addEventListener('click', () => {
    const location = document.getElementById('location-input').value.replace(' ', '_');
    fetchLandmarkData(location);
});

document.getElementById('explore-button').addEventListener('click', () => {
    const location = document.getElementById('location-select').value;
    fetchLandmarkData(location.replace(' ', '_'));
});

document.getElementById('view-ar-button').addEventListener('click', () => {
    const arPreview = document.getElementById('ar-preview');
    if (arPreview.getAttribute('src')) {
        arPreview.enterAR();
    } else {
        alert('AR model not available yet.');
    }
});

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

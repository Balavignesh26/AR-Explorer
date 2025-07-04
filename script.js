const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';

document.getElementById('search-button').addEventListener('click', () => {
    const location = document.getElementById('location-input').value.replace(' ', '_');
    fetchLandmarkData(location);
});

document.getElementById('select-button').addEventListener('click', () => {
    const location = document.getElementById('location-select').value;
    fetchLandmarkData(location.replace(' ', '_'));
});

async function fetchLandmarkData(location) {
    try {
        // Fetch from Wikipedia
        const wikiResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${location}`);
        const wikiData = await wikiResponse.json();
        
        // Update Wikipedia info
        document.getElementById('landmark-name-wiki').innerText = wikiData.title;
        document.getElementById('thumbnail').src = wikiData.thumbnail ? wikiData.thumbnail.source : '';
        document.getElementById('landmark-summary-wiki').innerText = wikiData.extract;

        // Fetch from Google Places
        const placeId = getPlaceId(location.replace('_', ' '));
        if (placeId) {
            const googleResponse = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${GOOGLE_API_KEY}`);
            const googleData = await googleResponse.json();
            
            // Update Google info
            if (googleData.result) {
                const googleResult = googleData.result;
                document.getElementById('landmark-name-google').innerText = googleResult.name;
                if (googleResult.rating) {
                    document.getElementById('landmark-rating-google').innerText = `Rating: ${googleResult.rating}/5`;
                } else {
                    document.getElementById('landmark-rating-google').innerText = 'No rating available';
                }
                if (googleResult.reviews && googleResult.reviews.length > 0) {
                    document.getElementById('user-reviews-google').innerText = googleResult.reviews[0].text;
                } else {
                    document.getElementById('user-reviews-google').innerText = 'No reviews available';
                }
            } else {
                document.getElementById('landmark-name-google').innerText = 'Not available';
                document.getElementById('landmark-rating-google').innerText = '';
                document.getElementById('user-reviews-google').innerText = '';
            }
        } else {
            document.getElementById('landmark-name-google').innerText = 'Not available';
            document.getElementById('landmark-rating-google').innerText = '';
            document.getElementById('user-reviews-google').innerText = '';
        }
    } catch (error) {
        console.error('Error fetching data:', error);
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
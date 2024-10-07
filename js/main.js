// Google Photos API implementation
const CLIENT_ID = 'YOUR_CLIENT_ID'; // Replace with your actual Client ID
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API Key
const ALBUM_ID = 'AF1QipM0Zfuwwl0PuQBMXaozsxdcK8ESF3a3jP87xo4G';

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/photoslibrary/v1/rest"];

// Authorization scopes required by the API
const SCOPES = 'https://www.googleapis.com/auth/photoslibrary.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.addEventListener('DOMContentLoaded', function() {
    gapiLoaded();
    gisLoaded();
});

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.display = 'block';
    }
}

document.getElementById('authorize_button').onclick = handleAuthClick;

function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        document.getElementById('authorize_button').innerText = 'Refresh';
        await listAlbumContents();
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
}

async function listAlbumContents() {
    let response;
    try {
        response = await gapi.client.photoslibrary.mediaItems.search({
            resource: {
                albumId: ALBUM_ID,
                pageSize: 100
            }
        });
    } catch (err) {
        console.error(err);
        return;
    }

    const mediaItems = response.result.mediaItems;
    if (!mediaItems || mediaItems.length == 0) {
        console.log('No media items found.');
        return;
    }

    const productGrid = document.querySelector('.product-grid');
    productGrid.innerHTML = ''; // Clear existing content
    mediaItems.forEach((item, index) => {
        const productCard = createProductCard({
            image: item.baseUrl,
            title: `Product ${index + 1}`,
            price: `₹${Math.floor(Math.random() * 2000) + 500}`
        });
        productGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.title}">
        <div class="product-info">
            <h3>${product.title}</h3>
            <p class="price">${product.price}</p>
            <a href="#" class="btn btn-secondary">Add to Cart</a>
        </div>
    `;
    return card;
}
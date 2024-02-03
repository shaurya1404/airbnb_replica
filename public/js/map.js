mapboxgl.accessToken = mapToken; // mapToken declared in show.ejs

const map = new mapboxgl.Map({
container: 'map', // container ID
center: listing.geometry.coordinates, // starting position [lng, lat]
zoom: 7 // starting zoom
});

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker({color: "red"})
    .setLngLat(listing.geometry.coordinates) 
    .setPopup(new mapboxgl.Popup({offset: 15, className: 'my-class'}) // Adding Popup functionality to the Marker
    .setHTML(`<h6>${listing.location}</h6><p>Exact location provided after booking</p`)
    .setMaxWidth("300px"))
    .addTo(map);
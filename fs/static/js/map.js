const map = L.map("map");
map.locate({ setView: true });
const marker_cluster_group = L.markerClusterGroup();
map.addLayer(marker_cluster_group);

// Add a tile layer (OpenStreetMap here, but you could also use Google Maps or others)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// a button that centers the map back to the user's location
var usr_nav_control = L.control({ position: "topright" });
usr_nav_control.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-bar");
  var button = L.DomUtil.create("button", "my-button");
  button.innerHTML = "To Me";
  L.DomEvent.on(button, "click", function (e) {
    L.DomEvent.stopPropagation(e);
    map.locate({ setView: true });
  });
  div.appendChild(button);
  return div;
};
usr_nav_control.addTo(map);

// Create the legend control
var legend = L.control({ position: "bottomright" });
legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML = `
        <h4>Legend</h4>
        <div>
            <img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" style="filter: hue-rotate(30deg); width: 20px; height: 20px; vertical-align: middle;">
            Porta Potty
        </div>
        <div>
            <img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" style="filter: hue-rotate(90deg); width: 20px; height: 20px; vertical-align: middle;">
            Regular
        </div>
        <div>
            <img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" style="filter: hue-rotate(150deg); width: 20px; height: 20px; vertical-align: middle;">
            Outhouse
        </div>
    `;
  return div;
};
// Add the legend to the map
legend.addTo(map);

// these are exported variables that keep track of user location on the map
export var user_lat;
export var user_lng;
map.on("locationfound", function (e) {
  user_lat = e.latitude;
  user_lng = e.longitude;
});

export { map, marker_cluster_group };

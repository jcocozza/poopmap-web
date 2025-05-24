import { Marker, create_marker } from "./marker.js";
import { create_location } from "./location.js";
import { add_marker_to_state } from "./main.js";

const min_zoom = 5;
const max_zoom = 16;

const map = L.map("map", {
  minZoom: min_zoom,
  maxZoom: max_zoom,
});
// map.locate({ setView: true });
map.setView([40.73061, -73.935242], 10);

const marker_cluster_group = L.markerClusterGroup();
map.addLayer(marker_cluster_group);

const token =
  "pk.eyJ1IjoiamNvY296emEiLCJhIjoiY21iMWU0YmFxMDZpczJqcHhvaWp0NDFvMiJ9.rH-ipZGyMEB4VX5B6kv6wg";

// see styles: https://docs.mapbox.com/api/maps/styles/
const style = "outdoors-v12";

L.tileLayer(
  `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/512/{z}/{x}/{y}?access_token=${token}`,
  {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: min_zoom,
    maxZoom: max_zoom,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://www.mapbox.com/about/maps/">Mapbox</a> <strong><a href="https://labs.mapbox.com/contribute/" target="_blank">Improve this map</a></strong>',
  },
).addTo(map);

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
        <div>
            <img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" style="filter: hue-rotate(0deg); width: 20px; height: 20px; vertical-align: middle;">
            Other 
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
map.on("locationerror", function (e) {
  console.error("Location error:", e.message);
});

map.on("click", function (e) {
  var lat = e.latlng.lat;
  var lng = e.latlng.lng;
  var popup = document.getElementById("new-location-modal");
  popup.style.display = "block";

  // close modal via 'x' button
  var modal_close_btn = document.getElementById("new-loc-modal-close-button");
  modal_close_btn.onclick = function () {
    popup.style.display = "none";
  };

  // somehow this allows the popup to be dismissed if you click off it
  window.onclick = function (e) {
    if (e.target == popup) {
      popup.style.display = "none";
    }
  };

  var form = document.getElementById("new-location-form");
  form.onsubmit = function (e) {
    e.preventDefault();
    // console.log(lat, lng);
    const data = new FormData(e.target);
    const name = data.get("name");
    const location_type = data.get("location-type");
    const accessible = data.get("accessible") != null; // if unchecked data.get("accessible") returns null
    const seasons = data.getAll("seasons");
    const info = data.get("info");
    create_location(
      lat,
      lng,
      name,
      location_type,
      accessible,
      seasons,
      info,
    ).then((uuid) => {
      const mkr = new Marker(
        uuid,
        lat,
        lng,
        name,
        location_type,
        accessible,
        seasons,
        info,
        0,
        0,
      );
      var m = create_marker(mkr);
      add_marker_to_state(mkr);
      marker_cluster_group.addLayer(m);
      form.reset();
      popup.style.display = "none";
    });
  };
});

export { map, marker_cluster_group };

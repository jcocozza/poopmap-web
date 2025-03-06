const map = L.map("map");

// naviagte to the user
map.locate({ setView: true });
// Add a tile layer (OpenStreetMap here, but you could also use Google Maps or others)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// a map that stores the displayed markers
const markers_state = new Map();

class Marker {
  constructor(
    uuid,
    lat,
    lng,
    name,
    location_type,
    accessible,
    seasons,
    info,
    upvotes,
    downvotes,
  ) {
    this.uuid = uuid;
    this.lat = lat;
    this.lng = lng;
    this.name = name;
    this.location_type = location_type;
    this.accessible = accessible;
    this.seasons = seasons;
    this.info = info;
    this.upvotes = upvotes;
    this.downvotes = downvotes;

    // set hue_rotate based on location_type
    // i am too lazy to create new markers (which is the correct way to do this)
    // so we're stuck with this hack
    if (location_type === "porta-potty") {
      this.hue_rotate = 30;
    } else if (location_type === "regular") {
      this.hue_rotate = 90;
    } else if (location_type === "outhouse") {
      this.hue_rotate = 150;
    } else {
      this.hue_rotate = 0; // Default value
    }
  }
}

// a button that centers the map back to the user's location
var buttonControl = L.control({ position: "topright" });
buttonControl.onAdd = function (map) {
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
buttonControl.addTo(map);

function upvote(uuid) {
  fetch(`${API_BASE_URL}/location/${uuid}/upvote`, {
    method: "POST",
  })
    .then(() => {
      markers_state.get(uuid).upvotes++;
    })
    .catch((error) => console.error("Error:", error));
}

function downvote(uuid) {
  fetch(`${API_BASE_URL}/location/${uuid}/downvote`, {
    method: "POST",
  })
    .then(() => {
      markers_state.get(uuid).downvotes++;
    })
    .catch((error) => console.error("Error:", error));
}

function create_marker_modal(mkr) {
  return `
      <div style="font-family: Arial, sans-serif; padding: 16px;">
          <h2 style="margin-bottom: 8px;">${mkr.name}</h2>
          <p><strong>Type:</strong> ${mkr.location_type}</p>
          <p><strong>Accessible:</strong> ${mkr.accessible ? "Yes" : "No"}</p>
          <p><strong>Seasons:</strong> ${mkr.seasons}</p>
          <label for="info" style="font-weight: bold; display: block; margin-top: 8px;">Additional Info:</label>
          <textarea id="info" style="width: 100%; min-height: 80px; padding: 8px;" readonly>${mkr.info}</textarea>
          <button onclick="upvote('${mkr.uuid}')">Like(${mkr.upvotes})</button>
          <button onclick="downvote('${mkr.uuid}')">Dislike(${mkr.downvotes})</button>
        </div>`;
}

function display_marker_modal(uuid) {
  mkr = markers_state.get(uuid);
  modal = document.getElementById("location-modal");
  modal_content = document.getElementById("location-dynamic-modal-content");
  // set the content
  modal_content.innerHTML = create_marker_modal(mkr);
  // actually make the modal show
  modal.style.display = "block";

  // when we want to close
  modal_close_btn = document.getElementById("modal-close-button");
  modal_close_btn.onclick = function () {
    modal.style.display = "none";
  };
  // somehow this allows the popup to be dismissed if you click off it
  window.onclick = function (e) {
    if (e.target == modal) {
      modal.style.display = "none";
    }
  };
}

// takes in a Marker()
function add_marker_to_map(mkr) {
  var m = L.marker([mkr.lat, mkr.lng]).addTo(map);
  m._icon.style.filter = `hue-rotate(${mkr.hue_rotate}deg)`;
  m.uuid = mkr.uuid;
  m.on("click", function (e) {
    display_marker_modal(mkr.uuid);
  });
}

async function load_locations() {
  const bounds = map.getBounds();
  const southwest = bounds.getSouthWest();
  const northeast = bounds.getNorthEast();
  await fetch(
    `${API_ROUTES.GET_LOCATIONS}?latlow=${southwest.lat}&lathigh=${northeast.lat}&lnglow=${southwest.lng}&lnghigh=${northeast.lng}`,
  )
    .then((resp) => resp.json())
    .then((data) => {
      for (let i = 0; i < data.length; i++) {
        const mkr = new Marker(
          data[i]["uuid"],
          data[i]["latitude"],
          data[i]["longitude"],
          data[i]["name"],
          data[i]["location_type"],
          data[i]["accessible"],
          data[i]["seasons"],
          data[i]["info"],
          data[i]["upvotes"],
          data[i]["downvotes"],
        );
        markers_state.set(mkr.uuid, mkr);
        add_marker_to_map(mkr);
      }
    })
    .catch((error) => console.error("Error:", error));
}
map.on('locationfound', function (e) {
  // Now that the map has been centered on the user's location
  load_locations();  // Call your location loading function here
});

map.on("moveend", function () {
  load_locations()
});

// returns new location uuid
async function create_location(
  lat,
  lng,
  name,
  location_type,
  accessible,
  seasons,
  info,
) {
  const payload = {
    latitude: lat,
    longitude: lng,
    name: name,
    location_type: location_type,
    accessible: accessible,
    seasons: seasons,
    info: info,
  };

  try {
    const resp = await fetch(API_ROUTES.NEW_LOCATION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let data = await resp.json();
    return data.uuid;
  } catch (error) {
    console.log(error);
  }
}

// ability to add to map when click on it
map.on("click", function (e) {
  var lat = e.latlng.lat;
  var lng = e.latlng.lng;

  popup = document.getElementById("new-location-modal");
  popup.style.display = "block";

  // close modal via 'x' button
  modal_close_btn = document.getElementById("new-loc-modal-close-button");
  modal_close_btn.onclick = function () {
    popup.style.display = "none";
  };

  // somehow this allows the popup to be dismissed if you click off it
  window.onclick = function (e) {
    if (e.target == popup) {
      popup.style.display = "none";
    }
  };

  form = document.getElementById("new-location-form");
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
      markers_state.set(uuid, mkr);
      add_marker_to_map(mkr);
      form.reset();
      popup.style.display = "none";
    });
  };
});

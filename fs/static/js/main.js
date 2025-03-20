import { map, marker_cluster_group } from "./map.js";
import { Marker, create_marker, update_modal_if_open } from "./marker.js";
import {
  get_locations,
  upvote as loc_upvote,
  downvote as loc_downvote,
} from "./location.js";

const markers_state = new Map();

function upvote(uuid) {
  loc_upvote().then(() => {
    markers_state.get(uuid).upvotes++;
    update_modal_if_open(markers_state.get(uuid));
  });
}

function downvote(uuid) {
  loc_downvote().then(() => {
    markers_state.get(uuid).downvotes++;
    update_modal_if_open(markers_state.get(uuid));
  });
}

window.upvote = upvote;
window.downvote = downvote;

async function init() {
  const bounds = map.getBounds();
  const southwest = bounds.getSouthWest();
  const northeast = bounds.getNorthEast();
  try {
    var locations = await get_locations(
      southwest.lat,
      northeast.lat,
      southwest.lng,
      northeast.lng,
    );
    for (let i = 0; i < locations.length; i++) {
      console.log("adding marker");
      const mkr = new Marker(
        locations[i]["uuid"],
        locations[i]["latitude"],
        locations[i]["longitude"],
        locations[i]["name"],
        locations[i]["location_type"],
        locations[i]["accessible"],
        locations[i]["seasons"],
        locations[i]["info"],
        locations[i]["upvotes"],
        locations[i]["downvotes"],
      );
      markers_state.set(mkr.uuid, mkr);
      var m = create_marker(mkr);
      // m._icon.style.filter = `hue-rotate(${mkr.hue_rotate}deg)`;
      marker_cluster_group.addLayer(m);
    }
  } catch (error) {
    console.error(error);
  }
}

map.on("moveend", function () {
  marker_cluster_group.clearLayers();
  init();
});

window.addEventListener("load", init);
// window.addEventListener('load', () => console.log("running init"));

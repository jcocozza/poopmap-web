import { map, marker_cluster_group } from "./map.js";
import { Marker, create_marker, update_modal_if_open } from "./marker.js";
import {
  get_locations,
  upvote as loc_upvote,
  downvote as loc_downvote,
} from "./location.js";

const markers_state = new Map();

export function add_marker_to_state(mkr) {
  markers_state.set(mkr.uuid, mkr);
}

function upvote(uuid) {
  loc_upvote(uuid).then(() => {
    markers_state.get(uuid).upvotes++;
    update_modal_if_open(markers_state.get(uuid));
  });
}

function downvote(uuid) {
  loc_downvote(uuid).then(() => {
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
      marker_cluster_group.addLayer(m);
      m._icon.style.filter = `hue-rotate(${mkr.hue_rotate}deg)`;
    }
  } catch (error) {
    console.error(error);
  }
}

async function update() {
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
    // this allows us to just keep the minimum amount of locations in memory
    // the basic idea is from the observation that
    // on zoom in, we probably decrease the number of locations
    // and on zoom out, we probably increase the number of locations
    // its not a guarantee, but a good enough heuristic
    if (locations.length < markers_state.size) {
      marker_cluster_group.clearLayers();
      markers_state.clear();
    }
    for (let i = 0; i < locations.length; i++) {
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
      if (!markers_state.has(mkr.uuid)) {
        markers_state.set(mkr.uuid, mkr);
        var m = create_marker(mkr);
        marker_cluster_group.addLayer(m);
        if (m && m._icon) {
          m._icon.style.filter = `hue-rotate(${mkr.hue_rotate}deg)`;
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

map.on("moveend", function () {
  update();
});

window.addEventListener("load", init);

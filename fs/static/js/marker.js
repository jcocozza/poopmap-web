import { user_lat, user_lng } from "./map.js";

export class Marker {
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

function create_marker_modal(mkr) {
  function rating() {
    if (mkr.upvotes === 0 && mkr.downvotes === 0) {
      return "unrated";
    }
    return `${Math.round((mkr.upvotes / (mkr.downvotes + mkr.upvotes)) * 100)}%`;
  }
  return `
      <div style="font-family: Arial, sans-serif; padding: 16px;">
          <h2 style="margin-bottom: 8px;">${mkr.name}</h2>
          <p><strong>Type:</strong> ${mkr.location_type}</p>
          <p><strong>Accessible:</strong> ${mkr.accessible ? "Yes" : "No"}</p>
          <p><strong>Seasons:</strong> ${mkr.seasons}</p>
          <label for="info" style="font-weight: bold; display: block; margin-top: 8px;">Additional Info:</label>
          <textarea id="info" style="width: 100%; min-height: 80px; padding: 8px;" readonly>${mkr.info}</textarea>
          <br>
          <p><strong><a href="https://www.google.com/maps/dir/?api=1&origin=${user_lat},${user_lng}&destination=${mkr.lat},${mkr.lng}">Directions</a></strong></p>
          <p><strong>Approval Rating:</strong> ${rating()}</p>
          <button onclick="upvote('${mkr.uuid}')">Like(${mkr.upvotes})</button>
          <button onclick="downvote('${mkr.uuid}')">Dislike(${mkr.downvotes})</button>
          ${create_comments_container()}
        </div>`;
}

function display_marker_modal(mkr) {
  var modal = document.getElementById("location-modal");
  var modal_content = document.getElementById("location-dynamic-modal-content");
  // set the content
  modal_content.innerHTML = create_marker_modal(mkr);
  // actually make the modal show
  modal.style.display = "block";
  // when we want to close
  var modal_close_btn = document.getElementById("modal-close-button");
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

export function create_marker(mkr) {
  var m = L.marker([mkr.lat, mkr.lng]);
  m.uuid = mkr.uuid;
  m.on("click", function (e) {
    display_marker_modal(mkr);
  });
  return m;
}

export function update_modal_if_open(mkr) {
  const modal = document.getElementById("location-modal");
  if (modal.style.display === "block") {
    const modal_content = document.getElementById(
      "location-dynamic-modal-content",
    );
    modal_content.innerHTML = create_marker_modal(mkr);
  }
}

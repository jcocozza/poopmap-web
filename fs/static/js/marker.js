import { user_lat, user_lng } from "./map.js";
import { get_comments, create_comment, update_location } from "./location.js";
import { upvote, downvote } from "./main.js";

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
    switch (location_type) {
      case "porta-potty":
        this.hue_rotate = 30;
        break;
      case "outhouse":
        this.hue_rotate = 150;
        break;
      case "regular":
        this.hue_rotate = 90;
        break;
      default:
        this.hue_rotate = 0; // Default value
        break;
    }
  }
}

function create_comments_container() {
  return `
          <!-- Comments Section -->
          <div class="comments-section" style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
            <h3>Comments</h3>
            <div id="comments-container" style="max-height: 200px; overflow-y: auto; margin-bottom: 10px;">
              <!-- Comments will be loaded here -->
              <p id="loading-comments">Loading comments...</p>
            </div>
            <!-- Add Comment Form -->
            <form id="add-comment-form" class="add-comment-form">
              <textarea id="new-comment" placeholder="Add your comment..." style="width: 100%; min-height: 60px; padding: 8px; margin-bottom: 8px;"></textarea>
              <button type="submit" style="padding: 6px 12px; background-color: #4CAF50; color: white; border: none; cursor: pointer;">
                Add Comment
              </button>
            </form>
          </div>
  `;
}

function comment_html(comment) {
  const commentElement = document.createElement("div");
  commentElement.className = "comment";
  commentElement.style.padding = "8px";
  commentElement.style.borderBottom = "1px solid #eee";
  commentElement.style.marginBottom = "8px";
  commentElement.innerHTML = `
    <p style="margin: 0; font-size: 0.9em; color: #666;">${comment.comment_time}</p>
    <p style="margin: 5px 0; white-space: initial;">${comment.text}</p>
  `;
  return commentElement;
}

async function load_and_display_comments(uuid) {
  const commentsContainer = document.getElementById(`comments-container`);
  try {
    const comments = await get_comments(uuid);
    if (comments.length == 0) {
      commentsContainer.innerHTML =
        '<p class="no-comments">No comments yet. Be the first to add one!</p>';
      return;
    }
    // TODO: need to actually implement this logic to add comments
    commentsContainer.innerHTML = "";
    for (var i = 0; i < comments.length; i++) {
      var comment = comments[i];
      const commentElement = comment_html(comment);
      commentsContainer.appendChild(commentElement);
    }
  } catch (error) {
    console.error(error);
    commentsContainer.innerHTML =
      '<p class="error">Error loading comments. Please try again.</p>';
  }
}

function create_marker_modal(mkr) {
  function rating() {
    if (mkr.upvotes === 0 && mkr.downvotes === 0) {
      return "unrated";
    }
    return `${Math.round((mkr.upvotes / (mkr.downvotes + mkr.upvotes)) * 100)}%`;
  }

  var google_maps_url;
  if (user_lat && user_lng) {
    google_maps_url = `https://www.google.com/maps/dir/?api=1&origin=${user_lat},${user_lng}&destination=${mkr.lat},${mkr.lng}`;
  } else {
    google_maps_url = `https://www.google.com/maps/dir/?api=1&destination=${mkr.lat},${mkr.lng}`;
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
          <p><strong><a href="${google_maps_url}" target="_blank">Directions</a></strong></p>
          <p><strong>Approval Rating:</strong> ${rating()}</p>
          <button onclick="upvote('${mkr.uuid}')">Like(${mkr.upvotes})</button>
          <button onclick="downvote('${mkr.uuid}')">Dislike(${mkr.downvotes})</button>
          ${create_comments_container()}
        </div>`;
}

function display_marker_modal(mkr) {
  // how we display the rating
  function rating_display() {
    if (mkr.upvotes === 0 && mkr.downvotes === 0) {
      return "unrated";
    }
    return `${Math.round((mkr.upvotes / (mkr.downvotes + mkr.upvotes)) * 100)}%`;
  }

  // google maps directions url
  var google_maps_url;
  if (user_lat && user_lng) {
    google_maps_url = `https://www.google.com/maps/dir/?api=1&origin=${user_lat},${user_lng}&destination=${mkr.lat},${mkr.lng}`;
  } else {
    google_maps_url = `https://www.google.com/maps/dir/?api=1&destination=${mkr.lat},${mkr.lng}`;
  }

  // here we inject data into the modal
  var modal = document.getElementById("location-modal");
  var name = document.getElementById("location-modal-name");
  name.textContent = mkr.name;
  var type = document.getElementById("location-modal-location-type");
  type.textContent = mkr.location_type;
  var accessible = document.getElementById("location-modal-accessible");
  accessible.textContent = mkr.accessible ? "Yes" : "No";
  var seasons = document.getElementById("location-modal-seasons");
  seasons.textContent = mkr.seasons;
  var info = document.getElementById("location-modal-info");
  info.value = mkr.info;
  var maps_url = document.getElementById("location-modal-maps-url");
  maps_url.href = google_maps_url;
  var rating = document.getElementById("location-modal-rating");
  rating.textContent = rating_display();
  var upvotes = document.getElementById("location-modal-upvotes");
  upvotes.textContent = mkr.upvotes;
  var downvotes = document.getElementById("location-modal-downvotes");
  downvotes.textContent = mkr.downvotes;
  var upvote_btn = document.getElementById("location-modal-upvote-btn");
  upvote_btn.onclick = () => {
    upvote(mkr.uuid);
  };
  var downvote_btn = document.getElementById("location-modal-downvote-btn");
  downvote_btn.onclick = () => {
    upvote(mkr.uuid);
  };

  // editing
  var edit_btn = document.getElementById("location-modal-edit-btn");
  edit_btn.onclick = () => edit_location_info(mkr);
  var save_btn = document.getElementById("location-modal-save-btn");
  save_btn.onclick = () => save_location_info(mkr);
  var cancel_btn = document.getElementById("location-modal-cancel-btn");
  cancel_btn.onclick = () => cancel_edit_location_info(mkr);

  var comments = document.getElementById("location-modal-comments");
  // setup listen to watch if new comment is submitted
  const commentForm = document.getElementById(`add-comment-form`);
  commentForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const commentInput = document.getElementById(`new-comment`);
    const comment_text = commentInput.value.trim();
    if (comment_text) {
      create_comment(mkr.uuid, comment_text);
      commentInput.value = "";
      const commentsContainer = document.getElementById(`comments-container`);
      // TODO: format Date.now() correctly
      const comment = { comment_time: Date.now(), text: comment_text };
      const commentElement = comment_html(comment);
      commentsContainer.appendChild(commentElement);
    }
  });
  load_and_display_comments(mkr.uuid);

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

function cancel_edit_location_info(mkr) {
  var edit_btn = document.getElementById("location-modal-edit-btn");
  var save_btn = document.getElementById("location-modal-save-btn");
  var cancel_btn = document.getElementById("location-modal-cancel-btn");
  edit_btn.style.display = "inline-block";
  save_btn.style.display = "none";
  cancel_btn.style.display = "none";

  display_marker_modal(mkr);
}

// TODO: not sure if this _really_ needs to be async
// we can probably just let the update happen on its own
async function save_location_info(mkr) {
  var edit_btn = document.getElementById("location-modal-edit-btn");
  var save_btn = document.getElementById("location-modal-save-btn");
  var cancel_btn = document.getElementById("location-modal-cancel-btn");

  // clean up
  const info_elm = document.getElementById("location-modal-info");
  info_elm.setAttribute("readonly", true);
  edit_btn.style.display = "inline-block";
  save_btn.style.display = "none";
  cancel_btn.style.display = "none";

  const name = document.getElementById("edit-name").value;
  const location_type = document.getElementById("edit-type").value;
  const accessible = document.getElementById("edit-accessible").checked;

  const seasons_elm = document.getElementById("location-modal-seasons");
  const seasons = Array.from(
    seasons_elm.querySelectorAll('input[type="checkbox"]:checked'),
  ).map((cb) => cb.value);
  const info = info_elm.value;

  mkr.name = name;
  mkr.location_type = location_type;
  mkr.accessible = accessible;
  mkr.seasons = seasons;
  mkr.info = info;
  await update_location(
    mkr.uuid,
    name,
    location_type,
    accessible,
    seasons,
    info,
  );
  display_marker_modal(mkr);
}

function edit_location_info(mkr) {
  var edit_btn = document.getElementById("location-modal-edit-btn");
  var save_btn = document.getElementById("location-modal-save-btn");
  var cancel_btn = document.getElementById("location-modal-cancel-btn");
  edit_btn.style.display = "none";
  save_btn.style.display = "inline-block";
  cancel_btn.style.display = "inline-block";
  const name = document.getElementById("location-modal-name");
  const type = document.getElementById("location-modal-location-type");
  const accessible = document.getElementById("location-modal-accessible");
  const seasons = document.getElementById("location-modal-seasons");
  const info = document.getElementById("location-modal-info");

  name.innerHTML = `<input type="text" id="edit-name" value="${mkr.name}" />`;
  type.innerHTML = `
      <select id="edit-type">
        <option value="outhouse" ${mkr.location_type === "outhouse" ? "selected" : ""}>Outhouse</option>
        <option value="porta-potty" ${mkr.location_type === "porta-potty" ? "selected" : ""}>Porta Potty</option>
        <option value="regular" ${mkr.location_type === "regular" ? "selected" : ""}>Regular</option>
      </select>
    `;
  accessible.innerHTML = `
      <input type="checkbox" id="edit-accessible" ${mkr.accessible === "Yes" ? "checked" : ""}/> Accessible
    `;
  // Split the string of seasons and create checkboxes
  const seasonList = ["summer", "fall", "winter", "spring"];
  seasons.innerHTML = seasonList
    .map(
      (season) => `
      <label><input type="checkbox" value="${season}" ${mkr.seasons.includes(season) ? "checked" : ""}/> ${season.charAt(0).toUpperCase() + season.slice(1)}</label>
    `,
    )
    .join(" ");
  info.removeAttribute("readonly");
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
    display_marker_modal(mkr);
  }
}

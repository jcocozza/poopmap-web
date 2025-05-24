import { API_BASE_URL, API_ROUTES } from "./config.js";

export async function get_locations(
  southwest_lat,
  northeast_lat,
  southwest_lng,
  northeast_lng,
) {
  const response = await fetch(
    `${API_ROUTES.GET_LOCATIONS}?latlow=${southwest_lat}&lathigh=${northeast_lat}&lnglow=${southwest_lng}&lnghigh=${northeast_lng}`,
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

export async function create_location(
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
  const response = await fetch(API_ROUTES.NEW_LOCATION, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let data = await response.json();
  return data.uuid;
}

export async function update_location(
  uuid,
  name,
  location_type,
  accessible,
  seasons,
  info,
) {
  const payload = {
    name: name,
    location_type: location_type,
    accessible: accessible,
    seasons: seasons,
    info: info,
  };
  const response = await fetch(`${API_BASE_URL}/location/${uuid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
}

export async function upvote(location_uuid) {
  const response = await fetch(
    `${API_BASE_URL}/location/${location_uuid}/upvote`,
    {
      method: "POST",
    },
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
}

export async function downvote(location_uuid) {
  const response = await fetch(
    `${API_BASE_URL}/location/${location_uuid}/downvote`,
    {
      method: "POST",
    },
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
}

export async function get_comments(location_uuid) {
  const response = await fetch(
    `${API_BASE_URL}/location/${location_uuid}/comments`,
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  let data = await response.json();
  return data;
}

export async function create_comment(location_uuid, text) {
  const payload = {
    text: text,
  };
  const response = await fetch(
    `${API_BASE_URL}/location/${location_uuid}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  let data = await response.json();
  return data;
}

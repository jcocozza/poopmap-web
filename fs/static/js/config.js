// TODO: clean up this config
// honestly I don't really like this way of doing things

export const API_BASE_URLS = {
    prod: "https://api.poopmap.xyz",
    dev: "http://localhost:54322"
};

export const config = {
    prod: {
          NEW_LOCATION: `${API_BASE_URLS.prod}/location`,
          GET_LOCATIONS: `${API_BASE_URLS.prod}/locations`,
        },
    dev: {
          NEW_LOCATION: `${API_BASE_URLS.dev}/location`,
          GET_LOCATIONS: `${API_BASE_URLS.dev}/locations`,
        },
};

// ENV is either prod or dev
export const ENV = 'dev';
export const API_BASE_URL = API_BASE_URLS[ENV];
export const API_ROUTES = config[ENV];


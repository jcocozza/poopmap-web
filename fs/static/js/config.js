export const API_BASE_URL = "http://localhost:54322/api";

export const config = {
  prod: {},
  dev: {
    NEW_LOCATION: `${API_BASE_URL}/location`,
    GET_LOCATIONS: `${API_BASE_URL}/locations`,
  },
};

export const ENV = 'dev'
export const API_ROUTES = config[ENV]

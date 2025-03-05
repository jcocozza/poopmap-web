const API_BASE_URL = "http://localhost:54322/api";

const config = {
  prod: {},
  dev: {
    NEW_LOCATION: `${API_BASE_URL}/location`,
    GET_LOCATIONS: `${API_BASE_URL}/locations`,
  },
};

const ENV = 'dev'
const API_ROUTES = config[ENV]

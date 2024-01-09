// Location module
// References: https://stackoverflow.com/questions/51420037/geolocation-export-lat-and-lng

// Comments:
// - Should I save the coordinates to a CONST instead of calling the function every time?
// - How would I save the coordinates to a variable available in the module? Using VAR?

import { openWeatherApiKey } from "./weather.js";

const navigatorOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

export async function getCountryCodeByIP() {
  try {
    const response = await axios.get(`https://ipapi.co/json/`);

    return response.data.country_code.toLowerCase();
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

async function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, navigatorOptions);
  });
}

export async function getCoordinates() {
  try {
    const geoLocationData = await getLocation();

    const { latitude: lat, longitude: lon } = geoLocationData.coords;

    return { lat, lon };
  } catch (e) {
    switch (e.code) {
      case e.PERMISSION_DENIED:
        console.log("User declined geolocation");
        break;
      case e.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable");
        break;
      case e.TIMEOUT:
        console.log("The request to get user location timed out");
        break;
      default:
        console.log("An unknown error occurred", e);
    }

    return { lat: NaN, lon: NaN };
  }
}

export async function getGeoIdByCoordinates(lat, lon) {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}`
    );

    const geoId = response.data["id"];
    const city = response.data["name"];

    return { id: geoId, name: city };
  } catch (e) {
    console.log(e);
  }
}

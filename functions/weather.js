import { format, isSameDay } from "https://cdn.skypack.dev/date-fns";
import { getGeoIdByCoordinates } from "./location.js";

export const openWeatherApiKey = "c41e68590ba8503efb6fbbc4cedf10fd";

// Get a text summary of the weather for UK
export async function getForecastById(id) {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?id=${id}&appid=${openWeatherApiKey}`
    );

    const forecastList = response.data.list;

    let forecast = {};

    for (let i = 0; i < forecastList.length; i++) {
      const forecastDate = format(
        new Date(forecastList[i]["dt_txt"]),
        "yyyy-MM-dd"
      );

      if (!forecast[forecastDate]) {
        forecast[forecastDate] = {
          max: forecastList[i]["main"]["temp_max"],
          min: forecastList[i]["main"]["temp_min"],
          icon: forecastList[i]["weather"][0]["icon"],
          description: forecastList[i]["weather"][0]["description"],
          date: isSameDay(forecastDate, new Date())
            ? "Today"
            : format(new Date(forecastList[i]["dt_txt"]), "EEE Do"),
        };
      } else {
        if (forecast[forecastDate]["max"] < forecastList[i]["main"]["temp"]) {
          forecast[forecastDate]["max"] = forecastList[i]["main"]["temp"];
        }

        if (forecast[forecastDate]["min"] > forecastList[i]["main"]["temp"]) {
          forecast[forecastDate]["min"] = forecastList[i]["main"]["temp"];
        }
      }
    }

    // convert forecast to array
    forecast = Object.values(forecast);
    return forecast;
  } catch (e) {
    console.log(e);
  }
}

export async function getWeatherByCoordinates(lat, lon) {
  // convert lat and lon coordinates to geoId
  const data = await getGeoIdByCoordinates(lat, lon);

  // get forecast by geoId
  const forecastData = await getForecastById(data["id"]);

  return { forecast: forecastData, name: data["name"] };
}

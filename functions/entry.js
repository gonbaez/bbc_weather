import * as domRef from "./domRef.js";

import { getCountryCodeByIP, getCoordinates } from "./location.js";
import { getNews } from "./news.js";
import { getCities, getCityGeoId } from "./cities.js";
import { getForecastById, getWeatherByCoordinates } from "./weather.js";

import { differenceInHours } from "https://unpkg.com/date-fns/differenceInHours.mjs";

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// LISTENERS

// Add listener to search checkbox
domRef.searchCheckRef.addEventListener("change", (e) => {
  if (e.target.checked) {
    domRef.weatherHeaderRef.classList.add("open");
  } else {
    domRef.weatherHeaderRef.classList.remove("open");
    domRef.searchLocationsRef.style.display = "none";
    domRef.searchInputRef.value = "";
  }
});

// If checkbox is not checked when search input is focused, check it
domRef.searchInputRef.addEventListener("focus", (e) => {
  if (!domRef.searchCheckRef.checked) {
    domRef.searchCheckRef.click();
  }
});

// Add listener to search input
domRef.searchInputRef.addEventListener("input", async (e) => {
  if (e.target.value.length >= 2) {
    const cities = await getCities(e.target.value);

    // Update DOM with cities
    const htmlCities = cities
      .map((city) => {
        const reg = new RegExp(e.target.value, "gi");
        const cityBold = city.replace(reg, (str) => {
          return `<b>${str}</b>`;
        });

        return `<li>${cityBold}</li>`;
      })
      .join("");

    domRef.searchLocationsRef.querySelector("ul").innerHTML = htmlCities; // Is this the right way of doing it?

    domRef.searchLocationsRef.style.display = "block";
  } else {
    domRef.searchLocationsRef.style.display = "none";
  }
});

// Hide feature news content and display loading spinner
Array.from(domRef.liFeaturesContentRef).forEach((content, index) => {
  content.style.display = "none";
});

Array.from(domRef.liFeaturesLoadingRef).forEach((loading, index) => {
  loading.style.display = "inline-block";
});

// Get country code
const countryCode = await getCountryCodeByIP();

console.log("Country code:", countryCode);

// Display domestic footer if country code is gb
if (countryCode === "gb") {
  domRef.domesticFooterRef.style.display = "block";
  domRef.internationalFooterRef.style.display = "none";
  domRef.forecastTitleRef.textContent = "Forecast for the UK";
  domRef.mapTitleRef.textContent = "UK Summary";
  domRef.mapImageRef.src = "./uk.png";
}

// Location button
domRef.locateMeButtonRef.addEventListener("click", async () => {
  const { lat, lon } = await getCoordinates();

  console.log("Coordinates:", lat, lon);

  const data = await getWeatherByCoordinates(lat, lon);

  changeToWeatherMode(data);
});

// Weather buttons
domRef.dayCarouselUlRef.addEventListener("click", async (e) => {
  e.target
    .closest("ul")
    .querySelectorAll("li")
    .forEach((li) => {
      li.classList.remove("selected");
    });

  e.target.closest("li").classList.add("selected");
});

// Search locations
domRef.searchLocationsUlRef.addEventListener("click", async (e) => {
  const city = e.target.closest("li").textContent;

  const geoId = await getCityGeoId(city);

  const forecast = await getForecastById(geoId["id"]);

  changeToWeatherMode({ forecast: forecast, name: geoId["name"] });

  console.log(domRef.searchCheckRef.checked);
  domRef.searchCheckRef.click();
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// NEWS

// Get news articles
const articles = await getNews(countryCode);

console.log("News:", articles);

// Update DOM with news articles
const currentDate = new Date();

Array.from(domRef.liFeaturesRef).forEach((li, index) => {
  if (articles[index].urlToImage) {
    li.querySelector("img").src = articles[index].urlToImage;
    li.querySelector("img").alt = articles[index].title;
  } else {
    li.querySelector("img").style.display = "none";
    li.querySelector("img + div").style["max-width"] = "100%";
  }

  li.querySelector("img ~ div > a").href = articles[index].url;
  li.querySelector("img ~ div > a > p").textContent =
    articles[index].description;

  li.querySelector("img ~ div > p > a").textContent =
    articles[index].source.name;

  let hourssincePublished = differenceInHours(
    currentDate,
    new Date(articles[index].publishedAt)
  );

  li.querySelector("img ~ div > p > span").textContent =
    hourssincePublished + "h";

  li.querySelector("h3").textContent = articles[index].title;

  li.querySelector(".content").style.display = "flex";
  li.querySelector(".lds-ripple").style.display = "none";
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// WEATHER

function changeToWeatherMode(data) {
  domRef.mapRef.style.display = "none";
  domRef.weatherByDayRef.style.display = "block";

  const forecast = data.forecast;
  const name = data.name;

  // Update city name
  domRef.cityNameRef.textContent = name;

  // Update DOM with forecast
  domRef.dayCarouselUlRef.innerHTML = forecast
    .map((day) => {
      let tempMax = day.max;
      let tempMin = day.min;

      if (domRef.temperatureSettingsRef.value === "c") {
        tempMax = Math.round(day.max - 273.15);
        tempMin = Math.round(day.min - 273.15);
      } else {
        tempMax = Math.round(((day.max - 273.15) * 9) / 5 + 32);
        tempMin = Math.round(((day.min - 273.15) * 9) / 5 + 32);
      }

      return `<li><button>
    <h3>${day.date}</h3>
    <div class="dayCont">
      <div class="icon">
        <img src="https://openweathermap.org/img/wn/${
          day.icon
        }@2x.png" alt="icon" />
      </div>
      <div class="temperatures">
        <p class="high">${tempMax}&deg;</p>
        <p class="low">${tempMin}&deg;</p>
      </div>
      <div class="description">
        <p>${
          day.description.substring(0, 1).toUpperCase() +
          day.description.substring(1)
        }</p>
      </div>
    </div>
  </button></li>`;
    })
    .join("");

  // Select first li
  domRef.dayCarouselUlRef.querySelector("li").classList.add("selected");
}

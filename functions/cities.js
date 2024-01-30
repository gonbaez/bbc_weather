async function getCities_(searchStr) {
  try {
    const response = await axios.get(
      `https://api.teleport.org/api/cities/?search=${searchStr}&limit=10`
    );

    // unpack matching_full_name from _embedded.city:search-results
    const cities = response.data._embedded["city:search-results"].map(
      (city) => city.matching_full_name
    );

    return cities;
  } catch (e) {
    console.log(e);
  }
}

async function getCityGeoId_(city) {
  try {
    const response = await axios.get(
      `https://api.teleport.org/api/cities/?search=${city}`
    );

    const href =
      response.data._embedded["city:search-results"][0]._links["city:item"]
        .href;

    const hrefResponse = await axios.get(href);

    const cityGeioId = hrefResponse.data["geoname_id"];
    const cityName = hrefResponse.data["name"];
    return { id: cityGeioId, name: cityName };
  } catch (e) {
    console.log(e);
  }
}

export async function getCities(searchStr) {
  try {
    const response = await axios.get(
      `http://geodb-free-service.wirefreethought.com/v1/geo/places?limit=10&offset=0&namePrefix=${searchStr}`
    );

    let cities = [];

    for (let i = 0; i < response.data.data.length; i++) {
      if (cities.length == 5) {
        break;
      }

      const cityObj = response.data.data[i];

      if (cityObj.placeType == "CITY") {
        cities.push(`${cityObj.name}, ${cityObj.country}`);
      }
    }

    return cities;
  } catch (e) {
    console.log(e);
  }
}

export async function getCityGeoId(cityAndCountry) {
  try {
    const city = cityAndCountry.split(",")[0];

    const response = await axios.get(
      `http://geodb-free-service.wirefreethought.com/v1/geo/places?limit=10&offset=0&namePrefix=${city}`
    );

    for (const cityObj of response.data.data) {
      if (`${cityObj.name}, ${cityObj.country}` === cityAndCountry) {
        return {
          id: cityObj.id,
          name: cityObj.name,
          lat: cityObj.latitude,
          lon: cityObj.longitude,
        };
      }
    }

    return null;
  } catch (e) {
    console.log(e);
  }
}

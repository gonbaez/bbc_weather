const apiKey = "twHTL6sd/ayCP6w+BiUzNw==vs99d7XeQ8Bhod0c";

export async function getCities(searchStr) {
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

export async function getCityGeoId(city) {
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

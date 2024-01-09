const apiKey = "3d28b913ba2c45fdbc5828e810152892";

export async function getNews(countryCode) {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=${countryCode}&apiKey=${apiKey}&pageSize=5` //&category=weather`
    );

    const articles = response.data.articles;

    return articles;
  } catch (e) {
    console.log(e);
  }
}

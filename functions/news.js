import { newsAapiKey } from "./env.js";

export async function getNews(countryCode) {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=${countryCode}&apiKey=${newsAapiKey}&pageSize=5` //&category=weather`
    );

    const articles = response.data.articles;

    return articles;
  } catch (e) {
    console.log(e);
  }
}

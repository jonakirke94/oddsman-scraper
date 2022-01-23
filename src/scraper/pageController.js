const pageScraper = require("./pageScraper");
async function scrapeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;
    console.log("Starting scraping of data");
    const data = await pageScraper.scraper(browser);
    console.log("Successfully scraped data");

    console.log("Closing browser..");
    await browser.close();

    return data;
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
    throw err;
  }
}

module.exports = (browserInstance) => scrapeAll(browserInstance);

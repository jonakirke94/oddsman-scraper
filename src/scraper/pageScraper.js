const scraperObject = {
  url: "https://dswebapp.sb.danskespil.dk/allekampe/den-lange",
  validDays: ["Lørdag", "Søndag", "Mandag"],
  async scraper(browser) {
    try {
      const page = await browser.newPage();

      await page.setRequestInterception(true);

      // block any images from loading since we are not using them
      page.on("request", (request) => {
        if (request.resourceType() === "image") request.abort();
        else request.continue();
      });

      console.log(`Navigating to ${this.url}...`);

      await page.goto(this.url);

      // Wait for the required DOM to be rendered
      await page.waitForSelector("#mainContent");

      console.log("Page is ready");

      // If we want to print console.log lines from code running inside $$eval which is executed in the browser context
      // We must add an eventlistener
      // page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

      // Get the link to all the required matches
      let urls = await page.$$eval(
        ".retailEventContainer",
        (containerHeaders, validDays) => {
          const seen = new Set();

          // here we can filter only the weekdays we are interested in.
          // we find the next occurrence of saturday, sunday and monday
          containerHeaders = containerHeaders.filter((containerHeader) => {
            const text =
              containerHeader.querySelector(".leftText p").textContent;
            const splitted = text.split(",");
            const weekday = splitted[0];

            const shouldInclude =
              validDays.includes(weekday) && !seen.has(weekday);

            seen.add(weekday);

            return shouldInclude;
          });

          const matchLinks = [];

          for (let containerHeader of containerHeaders) {
            let matchesForCurrentDay = Array.from(
              containerHeader.querySelectorAll(".preEventBody tr")
            );

            matchesForCurrentDay = matchesForCurrentDay.filter((el) => {
              return el.querySelector(".eventNumber").textContent.length <= 3;
            });

            matchLinks.push(
              ...matchesForCurrentDay.map((link) => {
                const linkValue = link.getAttribute("onclick");
                const strippedLink = linkValue.split("'")[1];
                return strippedLink;
              })
            );
          }

          return matchLinks;
        },
        this.validDays
      );

      console.log("urls", urls);

      // Loop through each of those links, navigate to the new page instance and get the relevant data from them
      let pagePromise = (link) =>
        new Promise(async (resolve, reject) => {
          try {
            await page.goto(link);

            await page.waitForSelector("#content");

            const title = await page.$eval(
              ".eventTitle",
              (text) => text.textContent
            );

            const headersEl = await page.$$eval(
              ".retailEventContainer",
              (containerHeaders, title) => {
                containerHeaders = containerHeaders.filter((header) => {
                  const text =
                    header.querySelector(".eventHeader p").textContent;
                  const splitted = text.split(" - ");
                  const matchNumber = splitted[0].trim();
                  return matchNumber.length <= 3;
                });

                const dataResult = [];

                for (const myHeader of containerHeaders) {
                  const text =
                    myHeader.querySelector(".eventHeader p").textContent;
                  const splitted = text.split(" - ");
                  const matchNumber = splitted[0].trim();

                  const subTitle = splitted[1].trim();

                  const getOddsText = (el) => {
                    return el.querySelector(".oneXTwoName").textContent;
                  };

                  const getOdds = (el) => {
                    return el.querySelector("span.odds-decimal").textContent;
                  };

                  const getTableData = (occurrence) => {
                    return myHeader.querySelector(
                      `table tr td:nth-child(${occurrence})`
                    );
                  };

                  const homeTableData = getTableData(2);
                  const homeText = getOddsText(homeTableData);
                  const homeOdds = getOdds(homeTableData);

                  const tiedTableData = getTableData(4);
                  const tiedText = getOddsText(tiedTableData);
                  // The tiedOdds may not exist if the match number only has a binary outcome such as Over/Under goals
                  const tiedOdds = tiedText ? getOdds(tiedTableData) : "";

                  const awayTableData = getTableData(6);
                  const awayText = getOddsText(awayTableData);
                  const awayOdds = getOdds(awayTableData);

                  dataResult.push({
                    matchNumber: parseInt(matchNumber),
                    title:
                      subTitle === "Kampvinder"
                        ? title
                        : `${title} - ${subTitle}`,
                    homeOdds: homeOdds,
                    homeText: homeText,
                    tiedOdds: tiedOdds,
                    tiedText: tiedText,
                    awayOdds: awayOdds,
                    awayText: awayText,
                  });
                }
                return dataResult;
              },
              title
            );

            resolve(headersEl);
          } catch (error) {
            reject(error);
          }
        });

      const result = [];

      for (const url in urls) {
        try {
          const currentPageData = await pagePromise(urls[url]);
          result.push(...currentPageData);
        } catch (error) {
          console.log("error in pagePromise", error);
        }
      }

      return result;
    } catch (error) {
      console.log("Scraping failed..", error);
    }
  },
};

module.exports = scraperObject;

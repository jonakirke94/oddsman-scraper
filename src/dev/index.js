const fs = require("fs");

// use local dev browser instance
const browserObject = require("./browser");
const scraperController = require("../scraper/pageController");
const buildSpreadsheet = require("../spreadsheet");

(async function () {
  //Start the browser and create a browser instance
  const browserInstance = browserObject.startBrowser(
    "C:Program FilesGoogleChromeApplicationchrome.exe"
  );

  // Pass the browser instance to the scraper controller
  const data = await scraperController(browserInstance);

  // Get Spreadsheet buffer
  const spreadsheet = await buildSpreadsheet(data);

  fs.open(`src/dev/catalogs/${spreadsheet.filename}`, "w", (err, fd) => {
    if (err) {
      console.log("Failed to create and open new file locally", err);
    } else {
      fs.write(fd, spreadsheet.buffer, 0, spreadsheet.buffer.length, (err) => {
        if (err) {
          console.log("Failed to write file locally!", err);
        } else {
          console.log("Successfully wrote to local file");
        }
      });
    }
  });
})();

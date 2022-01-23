const browserObject = require("./scraper/browser");
const scraperController = require("./scraper/pageController");
const sendEmailPromise = require("./email");

const buildSpreadsheet = require("./spreadsheet");

exports.handler = async function (event) {
  const browserInstance = browserObject.startBrowser();
  const data = await scraperController(browserInstance);

  const spreadsheet = await buildSpreadsheet(data);

  // for multiple recipents the to should be a comma separated string such as "x@gmail.com, y@gmail.com"
  return sendEmailPromise(spreadsheet, {
    to: "x@gmail.com",
    from: "x@gmail.com",
  });
};

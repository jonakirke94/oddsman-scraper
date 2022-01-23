const chromium = require("chrome-aws-lambda");

async function startBrowser() {
  let browser;
  try {
    console.log("Opening the browser......");
    browser = await chromium.puppeteer.launch({
      args: [
        ...chromium.args,
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--disable-features=AudioServiceOutOfProcess",
        "--single-process",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  } catch (err) {
    console.log("Could not create a browser instance => : ", err);
  }
  return browser;
}

module.exports = {
  startBrowser,
};

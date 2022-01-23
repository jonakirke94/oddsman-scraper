# Scraper

This project scrapes football matches from Danskespil being played on Saturday, Sunday and Monday with a matchnumber in the range 1-999

The data is persisted in an excel sheet which will be attached in an email in production and saved to a local folder when running locally.

# Production / AWS Lambda

The project is developd to run on AWS Lambda. This allows the scraping to run with a scheduled trigger.

AWS Lambda is very cost-efficient and makes email-integration with Amazon Simple Email Service (SES) very trivial.

The only limitation of AWS Lambda in this context is that dependencies cannot exceed 50mbs. To reduce bundle-size of this project the package-dependencies are added as layers to the lambda function.

The following layers are used:

- exceljs (packaged and deployed manually from the layers folder in this repo)
- nodemailer (packaged and deployed manually from the layers folder in this repo)
- chrome-aws-lambda (managed package optimized for size: https://github.com/alixaxel/chrome-aws-lambda)

The lambda function will automatically be able to reference our dependencies.

For example

`const chromium = require("chrome-aws-lambda");`

will automatically fetch the module from the layer.

The Lambda runtime will contain the `aws-sdk` package which is used to send the email. We do not need to install this depedency manually.

# Deploy

To deploy a new version the directory simply needs to be zipped and then uploaded.

This can be done programatically or manually by:

- Zip the `src` directory (exclude the `dev` dir as this is not needed in production). We do **not** need to zip any node_modules folders.

## Deploy a new layer

To deploy a new layer navigate to the path for example `exceljs/nodejs` and perform the following:

- `npm install`
- zip the `nodejs` folder **including** the just downloaded node_modules folder

# Run locally

The `layers` folder is not used for anything in local development.

Install we install the node modules locally

From the root path run:

- `npm install`

- `npm run scrape`

On completion a file will be added to `src/dev/catalogs`

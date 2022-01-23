var aws = require("aws-sdk");
var nodemailer = require("nodemailer");
var ses = new aws.SES({ region: "eu-central-1" });

async function sendEmailPromise({ buffer, filename }, options) {
  var mailOptions = {
    from: options.from,
    subject: "Programblad",
    to: options.to,
    attachments: [
      {
        filename,
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        content: buffer,
      },
    ],
  };

  // create Nodemailer SES transporter
  var transporter = nodemailer.createTransport({
    SES: ses,
  });

  return new Promise((resolve, reject) => {
    // send email
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        console.log("Error sending email");
        reject(err);
      } else {
        console.log("Email sent successfully");
        resolve("success");
      }
    });
  });
}

module.exports = sendEmailPromise;

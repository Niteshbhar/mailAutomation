import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
const NODEMAILER_CREDENTIALS = {
  email: "niteshbhardwaj2001@gmail.com",
  pass: "tqoozkwrfuiwwetk",
  host: "smtp.gmail.com",
};
export const sendEmailNodemailer = (email, clientName) => {
  var htmlTemplatePath;
  htmlTemplatePath = path.join(process.cwd(), "EmailTemplate/verifyEmail.html");

  fs.readFile(htmlTemplatePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading email template:", err);
      return;
    }

    const emailTemplate = data.replace("${customerName}", clientName);

    let transporter = nodemailer.createTransport({
      host: NODEMAILER_CREDENTIALS.host,
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: NODEMAILER_CREDENTIALS.email,
        pass: NODEMAILER_CREDENTIALS.pass,
      },
    });

    let mailOptions = {
      from: NODEMAILER_CREDENTIALS.email,
      to: email,

      cc: [],
      bcc: "",
      subject: "",
      html: emailTemplate,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Mail has been sent:", info.response);
      }
    });
  });
  return;
};

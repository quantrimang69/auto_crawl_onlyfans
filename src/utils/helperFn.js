const nodemailer = require('nodemailer');
require('dotenv').config();
const ejs = require('ejs');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.ADMIN_EMAIL_ADDRESS,
    clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
    clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
    accessToken: process.env.GOOGLE_MAILER_ACCESS_TOKEN,
}
});

exports.sendEmail = async (diffData) => {
  await transporter.verify();
  const emailTemplate = await ejs.renderFile('./src/views/email-template.ejs', { diffData });

  const mailOptions = {
    from: process.env.ADMIN_EMAIL_ADDRESS, 
    to: process.env.RECIPIENT_TO_EMAIL_ADDRESS, 
    subject: 'New Video',
    html: emailTemplate,
  };

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent to:', mailOptions.to);
    }
  });
}
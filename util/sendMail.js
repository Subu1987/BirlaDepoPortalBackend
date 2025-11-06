const nodemailer = require("nodemailer");

// Function to send an email using Nodemailer
async function sendEmail({ subject, text, html, to }) {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: "birlacorp-com.mail.protection.outlook.com",
    port: 25,
  });

  // Email content
  const mailOptions = {
    from: "noreply@birlacorp.com", // Sender address
    to: to, // Recipient address
    subject: subject, // Subject line
    text: text, // Plain text body
    html: html, // HTML body
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendEmail;

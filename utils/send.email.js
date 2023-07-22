import nodemailer from "nodemailer";

// Function to send an email using nodemailer.
const sendEmail = async function (email, subject, message) {
  try {
    // Create a reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // Set to true for port 465 (SSL/TLS), false for other ports
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Send the email with the defined transport object
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL, // Sender address
      to: email, // Recipient's email address
      subject: subject, // Subject line
      html: message, // HTML body of the email
    });
  } catch (error) {
    // If an error occurs during the email sending process, it will be caught here
    throw error;
  }
};

export default sendEmail;

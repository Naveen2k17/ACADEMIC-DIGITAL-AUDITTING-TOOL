const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    // For demonstration, use a "Development" transporter that logs to console.
    // In production, replace with actual SMTP credentials.
    let transporter;
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: 'gmail', // or your provider
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      // No config found, just mock the send
      console.log('--- MOCK EMAIL SENT ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${html}`);
      return;
    }

    const mailOptions = {
      from: `"Academic Audit Support Tool" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendEmail };

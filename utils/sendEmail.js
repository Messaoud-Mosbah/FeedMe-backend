const nodemailer = require('nodemailer');//without this biblio . node js cant send eamil


const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
        secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
   const info = await transporter.sendMail({
      from: `"DZ Community Food" <${process.env.EMAIL_USERNAME}>`, 
      to: email,
      subject: subject,
      text: message
    });
    console.log('Email sent successfully' ,info.messageId);
    return info; 
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error; 
  }
};

module.exports = {sendEmail};
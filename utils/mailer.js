const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS, },
  });

  return transporter;
}

async function sendContactNotification({ name, email, phone, subject, message }) {
  const t = getTransporter();
  if (!t) {
    console.log('Email not configured');
    return { sent: false };
  }

  const ownerMail = {
    from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    replyTo: email,
    subject: `📩 New Portfolio Message: ${subject || 'No Subject'}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color:#8b5cf6;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p style="background:#f4f4f4; padding: 16px; border-radius: 8px;">${message}</p>
      </div>
    `,
  };

  const autoReply = {
    from: `"Vakul Kumar Gaur" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Thanks for reaching out, ${name}! 🚀`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color:#8b5cf6;">Hi ${name},</h2>
        <p>Thanks for getting in touch! I've received your message and will get back to you within 24 hours.</p>
        <p><strong>Your message:</strong></p>
        <p style="background:#f4f4f4; padding: 16px; border-radius: 8px;">${message}</p>
        <p>Best,<br/>Vakul Kumar Gaur</p>
      </div>
    `,
  };

  try {
    await t.sendMail(ownerMail);
    await t.sendMail(autoReply);
    return { sent: true };
  } 
  
  catch (err) {
    console.error('Email send failed:', err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendContactNotification };
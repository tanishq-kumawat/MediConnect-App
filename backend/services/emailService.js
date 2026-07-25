import nodemailer from 'nodemailer';

// Configure Nodemailer Transporter (Uses Ethereal/Local fallback if no SMTP configured)
const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Fallback to test SMTP account (Ethereal) for development
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

/**
 * Send Email Notification to Doctor when a Patient books a new appointment slot
 */
export const sendBookingAlertToDoctor = async ({ doctorEmail, doctorName, patientName, date, timeslot, symptomsNotes, hospitalName, type }) => {
  try {
    const transporter = await createTransporter();
    const recipient = doctorEmail || 'doctor@jaipurmed.com';

    const mailOptions = {
      from: '"Jaipur MediConnect" <notifications@jaipurmed.com>',
      to: recipient,
      subject: `📋 New Appointment Request - Patient: ${patientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; borderRadius: 16px;">
          <h2 style="color: #14b8a6; margin-bottom: 8px;">Hello Dr. ${doctorName},</h2>
          <p style="font-size: 14px; color: #cbd5e1;">A patient has requested a consultation timeslot with you at <strong>${hospitalName}</strong>.</p>
          
          <div style="background-color: #1e293b; padding: 16px; border-radius: 12px; border: 1px solid #334155; margin: 16px 0;">
            <p style="margin: 4px 0;">👤 <strong>Patient Name:</strong> ${patientName}</p>
            <p style="margin: 4px 0;">📅 <strong>Requested Date:</strong> ${date}</p>
            <p style="margin: 4px 0;">⏰ <strong>Timeslot:</strong> ${timeslot}</p>
            <p style="margin: 4px 0;">💻 <strong>Mode:</strong> ${type}</p>
            ${symptomsNotes ? `<p style="margin: 4px 0; color: #38bdf8;">📝 <strong>Symptoms / Notes:</strong> ${symptomsNotes}</p>` : ''}
          </div>

          <p style="font-size: 13px; color: #94a3b8;">
            Please log in to your <strong>Doctor OPD Portal</strong> to verify your availability and confirm or decline this timeslot.
          </p>

          <a href="http://localhost:3000/login" style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">
            Open Doctor Portal & Verify Timeslot
          </a>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 [EMAIL SENT TO DOCTOR] To: ${recipient} | Message ID: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`🔗 Preview Email: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error('⚠️ Doctor Email Error:', error.message);
  }
};

/**
 * Send Email Notification to Patient when Doctor approves/confirms or declines the timeslot
 */
export const sendConfirmationToPatient = async ({ patientEmail, patientName, doctorName, hospitalName, date, timeslot, status, type }) => {
  try {
    const transporter = await createTransporter();
    const recipient = patientEmail || 'patient@jaipurmed.com';

    const isApproved = status === 'Confirmed';
    const subject = isApproved
      ? `✅ Appointment Confirmed by Dr. ${doctorName}!`
      : `⚠️ Appointment Timeslot Update - Dr. ${doctorName}`;

    const mailOptions = {
      from: '"Jaipur MediConnect" <notifications@jaipurmed.com>',
      to: recipient,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; borderRadius: 16px;">
          <h2 style="color: ${isApproved ? '#10b981' : '#f43f5e'}; margin-bottom: 8px;">
            ${isApproved ? 'Appointment Confirmed!' : `Appointment ${status}`}
          </h2>
          <p style="font-size: 14px; color: #cbd5e1;">Dear ${patientName},</p>
          <p style="font-size: 14px; color: #cbd5e1;">
            ${
              isApproved
                ? `Good news! Dr. <strong>${doctorName}</strong> has verified timeslot availability and <strong>CONFIRMED</strong> your appointment request.`
                : `Dr. <strong>${doctorName}</strong> has updated your appointment status to <strong>${status}</strong>.`
            }
          </p>

          <div style="background-color: #1e293b; padding: 16px; border-radius: 12px; border: 1px solid #334155; margin: 16px 0;">
            <p style="margin: 4px 0;">👨‍⚕️ <strong>Doctor:</strong> Dr. ${doctorName}</p>
            <p style="margin: 4px 0;">🏥 <strong>Hospital:</strong> ${hospitalName}</p>
            <p style="margin: 4px 0;">📅 <strong>Confirmed Date:</strong> ${date}</p>
            <p style="margin: 4px 0;">⏰ <strong>Confirmed Timeslot:</strong> ${timeslot}</p>
            <p style="margin: 4px 0;">💻 <strong>Consultation Type:</strong> ${type}</p>
          </div>

          ${
            isApproved && type === 'Online'
              ? `<p style="font-size: 13px; color: #38bdf8;">
                  You can access your live WebSockets Consultation Room at appointment time from your Patient Dashboard.
                </p>`
              : ''
          }

          <a href="http://localhost:3000/dashboard" style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">
            View Patient Dashboard
          </a>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 [EMAIL SENT TO PATIENT] To: ${recipient} | Message ID: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`🔗 Preview Email: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error('⚠️ Patient Email Error:', error.message);
  }
};

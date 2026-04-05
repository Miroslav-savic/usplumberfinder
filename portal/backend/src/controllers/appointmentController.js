const nodemailer = require("nodemailer");
const Post = require("../models/postModel");

async function submitAppointment(req, res) {
  const { name, email, phone, date, message } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Clinic not found" });

  const to = post.email || process.env.ADMIN_EMAIL || "business.smartdev@gmail.com";

  const html = `
    <h2 style="color:#0d9488">New Appointment Request – clinicFinder</h2>
    <table cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:15px">
      <tr><td><strong>Clinic:</strong></td><td>${post.companyName}</td></tr>
      <tr><td><strong>Patient Name:</strong></td><td>${name}</td></tr>
      <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
      <tr><td><strong>Phone:</strong></td><td>${phone || "—"}</td></tr>
      <tr><td><strong>Preferred Date:</strong></td><td>${date || "—"}</td></tr>
      <tr><td><strong>Message:</strong></td><td>${message || "—"}</td></tr>
    </table>
    <hr style="margin-top:24px"/>
    <p style="color:#94a3b8;font-size:12px">Sent via clinicFinder</p>
  `;

  // If SMTP not configured, just log and return success
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Appointment] ${post.companyName} | ${name} | ${email} | ${date || "no date"}`);
    return res.json({ message: "Appointment request received" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"clinicFinder" <${process.env.SMTP_USER}>`,
      to,
      subject: `Appointment Request – ${post.companyName}`,
      html,
    });

    return res.json({ message: "Appointment request sent" });
  } catch (err) {
    console.error("[Appointment email error]", err.message);
    return res.status(500).json({ message: "Failed to send appointment request" });
  }
}

module.exports = { submitAppointment };

require("dotenv").config(); // Load environment variables
const express = require("express");
const router = express.Router();
const dbConnect = require("../dbConnect");
const nodemailer = require("nodemailer");
const Pricing = require("../models/price");

dbConnect();

// Email Sending Function
async function sendEmail(to, subject, htmlContent) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER, // Secure way to store credentials
      pass: process.env.EMAIL_PASS, // Secure way to store credentials
    },
  });

  let info = await transporter.sendMail({
    from: `"Vilöserdet" <${process.env.EMAIL_USER}>`, // Avsändare
    to,
    subject,
    html: htmlContent, // HTML-meddelande
  });

  console.log("✅ Email sent:", info.response);
}

router.post("/", async (req, res) => {
  const {
    bookingId,
    customerEmail,
    customerName,
    bookingDate,
    price,
    address,
    newAddress,
    tid,
    rutChecked,
    houseSpace,
  } = req.body;

  if (
    !bookingId ||
    !customerEmail ||
    !customerName ||
    !bookingDate ||
    !price ||
    !address ||
    !newAddress ||
    !tid
  ) {
    return res
      .status(400)
      .json({ message: "Missing required booking details" });
  }

  try {
    const pricingTier = await Pricing.findOne({
      minSize: { $lte: houseSpace }, // Less than or equal to size
      maxSize: { $gte: houseSpace }, // Greater than or equal to size
    });
    console.log("📩 Sending confirmation email to:", customerEmail);

    // Email Content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5;">
        <h2 style="color: #2c3e50;">📌 Bokningsbekräftelse – #${bookingId}</h2>
        <p>Hej <strong>${customerName}</strong>,</p>
        <p>Tack för din bokning hos <strong>Vilöserdet</strong>! Här är detaljerna för din bokning:</p>
        <hr>
        <p><strong>🛠️ Tjänst:</strong> FlyttHjälp</p>
        <p><strong>📅 Datum:</strong> ${new Date(
          bookingDate
        ).toLocaleDateString()} kl:${tid}</p>
        <p><strong>📦 Nurvarande Adress:</strong> ${address}</p>
        <p><strong>🏡 Ny Adress:</strong> ${newAddress}</p>
        <p><strong>💰 Pris:</strong> ${price} SEK${
      rutChecked ? " (pris efter RUT)" : ""
    }</p>
        <p><strong>🧹 Ingår I Priset:</strong> ${
          pricingTier.includedServices
        }</p>
        <hr>
        <p>Om du behöver ändra eller avboka tiden, vänligen kontakta oss senast tre arbetsdagar innan den avtalade tiden.</p>
        <p>Om du har några frågor eller behöver ändra din bokning, kontakta oss på:</p>
        <p>📧 <a href="mailto:info@viloserdet.se">info@viloserdet.se </a> | 📞 123-456 789</p>
        <p>📄 Genom att boka godkänner du våra <a href="https://www.vilöserdet.se/Ingariflytthjalp" target="_blank" style="color: #0D3F53; text-decoration: underline;">avtalsvillkor</a>.</p>
        <p>Med vänliga hälsningar,</p>
        <p><strong>Orgnummer: </strong>880531–7958 </p>
        <p><strong>Telefon: </strong>+46 72-267774</p>
        <p><strong>Vilöserdet</strong></p>
      </div>
    `;

    await sendEmail(
      customerEmail,
      `Bokningsbekräftelse – #${bookingId}`,
      emailContent
    );

    console.log("✅ Confirmation email sent successfully.");
    res.json({ message: "Confirmation sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending confirmation:", error);
    res
      .status(500)
      .json({ message: "Failed to send confirmation", error: error.message });
  }
});
router.post("/Flyttstad", async (req, res) => {
  const {
    bookingId,
    customerEmail,
    customerName,
    bookingDate,
    finalTotalPrice,
    address,
    tid,
    rutChecked,
  } = req.body;

  if (
    !bookingId ||
    !customerEmail ||
    !customerName ||
    !bookingDate ||
    !finalTotalPrice ||
    !address ||
    !tid
  ) {
    return res
      .status(400)
      .json({ message: "Missing required booking details" });
  }

  try {
    console.log("📩 Sending confirmation email to:", customerEmail);

    // Email Content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5;">
        <h2 style="color: #2c3e50;">📌 Bokningsbekräftelse – #${bookingId}</h2>
        <p>Hej <strong>${customerName}</strong>,</p>
        <p>Tack för din bokning hos <strong>Vilöserdet</strong>! Här är detaljerna för din bokning:</p>
        <hr>
        <p><strong>🛠️ Tjänst:</strong> FlyttStäd</p>
        <p><strong>📅 Datum:</strong> ${new Date(
          bookingDate
        ).toLocaleDateString()} kl:${tid}</p>
        <p><strong>🏡 Adress:</strong> ${address}</p>
        <p><strong>💰 Pris:</strong> ${finalTotalPrice.toFixed(2)} SEK${
      rutChecked ? " (pris efter RUT)" : ""
    }</p>
       
        <hr>
        <p>Om du behöver ändra eller avboka tiden, vänligen kontakta oss senast tre arbetsdagar innan den avtalade tiden.</p>
        <p>Om du har några frågor eller behöver ändra din bokning, kontakta oss på:</p>
        <p>📧 <a href="mailto:info@viloserdet.se">info@viloserdet.se </a> | 📞 123-456 789</p>
        <p>📄 Genom att boka godkänner du våra <a href="https://www.vilöserdet.se/Ingariflyttstadingen" target="_blank" style="color: #0D3F53; text-decoration: underline;">avtalsvillkor</a>.</p>
        <p>Med vänliga hälsningar,</p>
        <p><strong>Orgnummer: </strong>880531–7958 </p>
        <p><strong>Telefon: </strong>+46 72-267774</p>
        <p><strong>Vilöserdet</strong></p>
      </div>
    `;

    await sendEmail(
      customerEmail,
      `Bokningsbekräftelse – #${bookingId}`,
      emailContent
    );

    console.log("✅ Confirmation email sent successfully.");
    res.json({ message: "Confirmation sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending confirmation:", error);
    res
      .status(500)
      .json({ message: "Failed to send confirmation", error: error.message });
  }
});
router.post("/visningstad", async (req, res) => {
  const {
    bookingId,
    customerEmail,
    customerName,
    bookingDate,
    finalTotalPrice,
    address,
    tid,
    rutChecked,
  } = req.body;

  if (
    !bookingId ||
    !customerEmail ||
    !customerName ||
    !bookingDate ||
    !finalTotalPrice ||
    !address ||
    !tid
  ) {
    return res
      .status(400)
      .json({ message: "Missing required booking details" });
  }

  try {
    console.log("📩 Sending confirmation email to:", customerEmail);

    // Email Content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5;">
        <h2 style="color: #2c3e50;">📌 Bokningsbekräftelse – #${bookingId}</h2>
        <p>Hej <strong>${customerName}</strong>,</p>
        <p>Tack för din bokning hos <strong>Vilöserdet</strong>! Här är detaljerna för din bokning:</p>
        <hr>
        <p><strong>🛠️ Tjänst:</strong> Visningstäd</p>
        <p><strong>📅 Datum:</strong> ${new Date(
          bookingDate
        ).toLocaleDateString()} kl:${tid}</p>
        <p><strong>🏡 Adress:</strong> ${address}</p>
        <p><strong>💰 Pris:</strong> ${finalTotalPrice} SEK${
      rutChecked ? " (pris efter RUT)" : ""
    }</p>
       
        <hr>
        <p>Om du behöver ändra eller avboka tiden, vänligen kontakta oss senast tre arbetsdagar innan den avtalade tiden.</p>
        <p>Om du har några frågor eller behöver ändra din bokning, kontakta oss på:</p>
        <p>📧 <a href="mailto:info@viloserdet.se">info@viloserdet.se </a> | 📞 123-456 789</p>
        <p>📄 Genom att boka godkänner du våra <a href="https://www.vilöserdet.se/Ingarivisningsstadning" target="_blank" style="color: #0D3F53; text-decoration: underline;">avtalsvillkor</a>.</p>
        <p>Med vänliga hälsningar,</p>
        <p><strong>Orgnummer: </strong>880531–7958 </p>
        <p><strong>Telefon: </strong>+46 72-267774</p>
        <p><strong>Vilöserdet</strong></p>
      </div>
    `;

    await sendEmail(
      customerEmail,
      `Bokningsbekräftelse – #${bookingId}`,
      emailContent
    );

    console.log("✅ Confirmation email sent successfully.");
    res.json({ message: "Confirmation sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending confirmation:", error);
    res
      .status(500)
      .json({ message: "Failed to send confirmation", error: error.message });
  }
});
router.post("/contact", async (req, res) => {
  const { name, email, number, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5;">
        <h2 style="color: #2c3e50;">Nytt kontaktformulär</h2>
        <p><strong>Namn:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${number || "Ej angivet"}</p>
        <hr>
        <h3>Meddelande:</h3>
        <p>${message}</p>
      </div>
    `;

    await sendEmail(
      process.env.EMAIL_USER, // Send to your company email
      `Nytt kontaktformulär från ${name}`,
      emailContent
    );

    console.log("✅ Contact form email sent successfully");
    res.json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending contact form:", error);
    res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
});

// Export the router
module.exports = router;

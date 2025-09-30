require("dotenv").config(); // Load environment variables
const express = require("express");
const router = express.Router();
const dbConnect = require("../dbConnect");
const nodemailer = require("nodemailer");
const Pricing = require("../models/price");
const ExtraService = require("../models/ExtraService");

dbConnect();

// Email Sending Function
async function sendEmail(to, subject, htmlContent) {
  console.log("🔍 Starting email send...");
  console.log("📧 Email user:", process.env.EMAIL_USER ? "Set" : "MISSING");
  console.log("🔑 Email pass:", process.env.EMAIL_PASS ? "Set" : "MISSING");

  let transporter = nodemailer.createTransport({
    host: "send.one.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    logger: true, // Enable logging
    debug: true, // Enable debug output
  });

  try {
    console.log("🔌 Verifying connection...");
    await transporter.verify();
    console.log("✅ Connection verified");

    console.log("📨 Sending email...");
    let info = await transporter.sendMail({
      from: `"Vilöserdet" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log("✅ Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Full error:", error);
    console.error("❌ Error code:", error.code);
    console.error("❌ Error message:", error.message);
    throw error;
  }
}
router.post("/", async (req, res) => {
  const extraPrices = await ExtraService.findOne({});
  const {
    orderNumber,
    customerEmail,
    customerName,
    bookingDate,
    price,
    address,
    newAddress,
    tid,
    rutChecked,
    houseSpace,
    packgingPrice,
    furniturePrice,
    cleaningPrice,
    basePrice,
    packingOption,
    storagePrice,
    messageTo,
    discountedPrice,
    cleaningDate,
    persienner,
    extraBadrum,
    extraToalett,
    inglasadDuschhörna,
    diskmaskin,
    tvattmaskin,
    torktumlare,
    insidanMaskiner,
    selectedPacking,
    selectedDisposal,
    selectedCleaning,
    storageDate,
  } = req.body;

  if (
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
    let extraMessageToCustomer = "";

    if (messageTo && messageTo.trim() !== "") {
      extraMessageToCustomer = `
    <div style="margin-top: 20px; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">
      <p><strong>📩 Meddelande från oss:</strong></p>
      <p>${messageTo}</p>
    </div>
  `;
    }
    let adjustedPackagingPrice = packgingPrice;

    if (
      selectedPacking == "Ja" &&
      packingOption === "Bara Kök" &&
      packgingPrice
    ) {
      adjustedPackagingPrice = Math.round(packgingPrice * 0.4);
    }

    let extraServices = "";
    let selectedExtras = "";

    if (
      selectedPacking == "Ja" &&
      adjustedPackagingPrice &&
      adjustedPackagingPrice !== 0
    ) {
      extraServices += `<p><strong>📦 Packhjälp:</strong> ${adjustedPackagingPrice} SEK</p>`;
    }
    if (storagePrice && storagePrice !== 0) {
      extraServices += `<p><strong>🏢 Magasinering Pris:</strong> ${storagePrice} SEK</p>`;
      extraServices += `<p><strong>📅 Magasinering Datum:</strong> ${
        new Date(storageDate).toISOString().split("T")[0]
      }</p>`;
    }
    if (selectedDisposal == "Ja" && furniturePrice && furniturePrice !== 0) {
      extraServices += `<p><strong>🛠️  Möbel Bortslig:</strong> ${furniturePrice} SEK</p>`;
    }
    if (selectedCleaning == "Ja" && cleaningPrice && cleaningPrice !== 0) {
      const discountedCleaningPrice = Math.round(cleaningPrice * 0.85);
      extraServices += `
    <p><strong>🧼 Flyttstädning:</strong> <span style="text-decoration: line-through;">${cleaningPrice} SEK</span></p>
    <p style="margin-left: 20px;">➡️ <strong>Efter Rabatt</strong> ${discountedCleaningPrice} SEK</p>
    <p><strong>📅 Flyttstädning Datum:</strong> ${
      new Date(cleaningDate).toISOString().split("T")[0]
    } </p>
  `;
    }

    if (persienner && parseInt(persienner) > 0) {
      selectedExtras += `<li>Persienner (${persienner} st): ${
        extraPrices.persienner * parseInt(persienner)
      } SEK</li>`;
    }
    if (extraBadrum == "Ja") {
      selectedExtras += `<li>Extra Badrum: ${extraPrices.extraBadrum} SEK</li>`;
    }
    if (extraToalett == "Ja") {
      selectedExtras += `<li>Extra Toalett: ${extraPrices.extraToalett} SEK</li>`;
    }
    if (inglasadDuschhörna == "Ja") {
      selectedExtras += `<li>Inglasad Duschhörna: ${extraPrices.inglasadDuschhörna} SEK</li>`;
    }
    if (insidanMaskiner == "Ja") {
      if (diskmaskin) {
        selectedExtras += `<li>Diskmaskin: ${extraPrices.diskmaskin} SEK</li>`;
      }
      if (tvattmaskin) {
        selectedExtras += `<li>Tvättmaskin: ${extraPrices.tvattmaskin} SEK</li>`;
      }
      if (torktumlare) {
        selectedExtras += `<li>Torktumlare: ${extraPrices.torktumlare} SEK</li>`;
      }
    }
    let villkor = "";
    if (selectedCleaning == "Ja" && cleaningPrice && cleaningPrice !== 0) {
      villkor = `<p>
        📄 Här hittar du våra avtalsvillkor som gäller för din bokning: <strong>Flyttstädning</strong>
        <a
          href="https://www.vilöserdet.se/Ingariflyttstadingen"
          target="_blank"
          style="color: #0D3F53; text-decoration: underline;"
        >
          avtalsvillkor
        </a>
        .
      </p>`;
    }
    console.log("📩 Sending confirmation email to:", customerEmail);
    console.log(packingOption);

    // Email Content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5;">
        
        <h2 style="color: #2c3e50;">📌 Bokningsbekräftelse – #${
          orderNumber || customerName
        }</h2>
        <p>Hej <strong>${customerName}</strong>,</p>
        <p>Tack för din bokning hos <strong>Vilöserdet</strong>! Här är detaljerna för din bokning:</p>
        <hr>
        <p><strong>🛠️ Tjänst:</strong> Flytthjälp</p>
        <p><strong>📅 Datum:</strong> ${
          new Date(bookingDate).toISOString().split("T")[0]
        } kl:${tid}</p>
        <p><strong>🏡 Nurvarande Adress:</strong> ${address}</p>
        <p><strong>🏡 Ny Adress:</strong> ${newAddress}</p>
        ${
          basePrice !== 0
            ? discountedPrice && discountedPrice !== 0
              ? `<p><strong>💰 Flytthjälp Pris:</strong> <s>${
                  basePrice + discountedPrice
                } SEK</s>`
              : `<p><strong>💰 Flytthjälp Pris:</strong> ${basePrice} SEK</p>`
            : ""
        }
        ${
          discountedPrice !== 0
            ? `<p style="margin-left: 20px;"><strong>💰 Pris Efter Rabatt:</strong> ${basePrice} SEK </p>`
            : ""
        }
        ${extraServices}
        ${
          selectedExtras
            ? `<div><strong>➕ Valda Extra Tjänster (Flyttstädning):</strong><ul>${selectedExtras}</ul></div><hr>`
            : ""
        }
        <p><strong>💰 Total Pris:</strong> ${Math.round(price)} SEK${
      rutChecked ? " (pris efter RUT)" : ""
    }</p>
    ${extraMessageToCustomer}

     
        <p><strong>🧹 Ingår I Priset:</strong> ${
          pricingTier.includedServices
        }</p>
        <hr>
        <p>Om du behöver ändra eller avboka tiden, vänligen kontakta oss senast tre arbetsdagar innan den avtalade tiden.</p>
        <p>Om du har några frågor eller behöver ändra din bokning, kontakta oss på:</p>
        <p>📧 <a href="mailto:info@viloserdet.se">info@viloserdet.se </a> | 📞 010-555 88 93</p>
        <p>📄 Här hittar du våra avtalsvillkor som gäller för din bokning: <a href="https://www.vilöserdet.se/Ingariflytthjalp" target="_blank" style="color: #0D3F53; text-decoration: underline;">avtalsvillkor</a>.</p>
        ${villkor}
        <p>Med vänliga hälsningar,</p>
        <p><strong>Orgnummer: </strong>880531–7958 </p>
        <p><strong>Telefon: </strong>010-555 88 93</p>
        <p><strong>Vilöserdet</strong></p>
       <div style="text-align: left; margin-bottom: 20px;">
          <img src="https://www.vilöserdet.se/logoScroll.svg" alt="Vilöserdet Logo" style="max-width: auto; height: auto;">
        </div>
      </div>
    `;

    await sendEmail(
      customerEmail,
      `Bokningsbekräftelse – #${orderNumber || customerName}`,
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
  const extraPrices = await ExtraService.findOne({});
  const {
    orderNumber,
    customerEmail,
    customerName,
    bookingDate,
    finalTotalPrice,
    totalPrice,
    address,
    tid,
    rutChecked,
    persienner,
    extraBadrum,
    extraToalett,
    inglasadDuschhörna,
    insidanMaskiner,
    diskmaskin,
    tvattmaskin,
    torktumlare,
    adminMessage,
    discountedPrice,
  } = req.body;

  if (
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
    let extraMessageToCustomer = "";

    if (adminMessage && adminMessage.trim() !== "") {
      extraMessageToCustomer = `
    <div style="margin-top: 20px; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">
      <p><strong>📩 Meddelande från oss:</strong></p>
      <p>${adminMessage}</p>
    </div>
  `;
    }

    let selectedExtras = "";

    if (persienner && parseInt(persienner) > 0) {
      selectedExtras += `<li>Persienner (${persienner} st): ${
        extraPrices.persienner * parseInt(persienner)
      } SEK</li>`;
    }
    if (extraBadrum == "Ja") {
      selectedExtras += `<li>Extra Badrum: ${extraPrices.extraBadrum} SEK</li>`;
    }
    if (extraToalett == "Ja") {
      selectedExtras += `<li>Extra Toalett: ${extraPrices.extraToalett} SEK</li>`;
    }
    if (inglasadDuschhörna == "Ja") {
      selectedExtras += `<li>Inglasad Duschhörna: ${extraPrices.inglasadDuschhörna} SEK</li>`;
    }
    if (insidanMaskiner == "Ja") {
      if (diskmaskin) {
        selectedExtras += `<li>Diskmaskin: ${extraPrices.diskmaskin} SEK</li>`;
      }
      if (tvattmaskin) {
        selectedExtras += `<li>Tvättmaskin: ${extraPrices.tvattmaskin} SEK</li>`;
      }
      if (torktumlare) {
        selectedExtras += `<li>Torktumlare: ${extraPrices.torktumlare} SEK</li>`;
      }
    }
    // Email Content
    const emailContent = `
  <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5;">
    <h2 style="color: #2c3e50;">📌 Bokningsbekräftelse – #${
      orderNumber || customerName
    }</h2>
    <p>Hej <strong>${customerName}</strong>,</p>
    <p>Tack för din bokning hos <strong>Vilöserdet</strong>! Här är detaljerna för din bokning:</p>
    <hr>
    <p><strong>🛠️ Tjänst:</strong> Flyttstädning</p>
    <p><strong>📅 Datum:</strong> ${
      new Date(bookingDate).toISOString().split("T")[0]
    } Kl: ${tid}</p>
    <p><strong>🏡 Adress:</strong> ${address}</p>
   ${
     totalPrice !== 0
       ? discountedPrice && discountedPrice !== 0
         ? `<p><strong>💰 Flyttstädning Pris:</strong> <s>${
             totalPrice + discountedPrice
           } SEK</s>`
         : `<p><strong>💰 Flyttstädning Pris:</strong> ${
             totalPrice || finalTotalPrice
           } SEK</p>`
       : ""
   }
  
   ${
     discountedPrice !== 0
       ? `<p style="margin-left: 20px;"><strong>💰 Pris Efter Rabatt:</strong> ${totalPrice} SEK </p>`
       : ""
   }

    ${
      selectedExtras
        ? `<div><strong>➕ Valda Extra Tjänster:</strong><ul>${selectedExtras}</ul></div><hr>`
        : ""
    }
    <p><strong>💰 Total Pris:</strong> ${finalTotalPrice.toFixed(2)} SEK${
      rutChecked ? " (pris efter RUT)" : ""
    }</p>
    ${extraMessageToCustomer}
    <hr>
     <p>Om du behöver ändra eller avboka tiden, vänligen kontakta oss senast tre arbetsdagar innan den avtalade tiden.</p>
        <p>Om du har några frågor eller behöver ändra din bokning, kontakta oss på:</p>
        <p>📧 <a href="mailto:info@viloserdet.se">info@viloserdet.se </a> | 📞 010-555 88 93</p>
        <p>📄 Genom att boka godkänner du våra <a href="https://www.vilöserdet.se/Ingariflytthjalp" target="_blank" style="color: #0D3F53; text-decoration: underline;">avtalsvillkor</a>.</p>
        <p>Med vänliga hälsningar,</p>
        <p><strong>Orgnummer: </strong>880531–7958 </p>
        <p><strong>Telefon: </strong>010-555 88 93</p>
        <p><strong>Vilöserdet</strong></p>
       <div style="text-align: left; margin-bottom: 20px;">
          <img src="https://www.vilöserdet.se/logoScroll.svg" alt="Vilöserdet Logo" style="max-width: auto; height: auto;">
        </div>
    ...
  </div>
`;

    await sendEmail(
      customerEmail,
      `Bokningsbekräftelse – #${orderNumber || customerName}`,
      emailContent
    );

    console.log("✅ Confirmation email sent successfully.");
    res.json({ message: "Confirmation sent successfully!" });
  } catch (error) {
    console.error("❌ Error sending confirmation:", error.message);
    res
      .status(500)
      .json({ message: "Failed to send confirmation", error: error.message });
  }
});
router.post("/visningstad", async (req, res) => {
  const extraPrices = await ExtraService.findOne({});
  const {
    orderNumber,
    customerEmail,
    customerName,
    bookingDate,
    finalTotalPrice,
    address,
    tid,
    rutChecked,
    persienner,
    extraBadrum,
    extraToalett,
    inglasadDuschhörna,
    insidanMaskiner,
    diskmaskin,
    tvattmaskin,
    torktumlare,
    adminMessage,
    totalPrice,
  } = req.body;

  if (
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
    let extraMessageToCustomer = "";

    if (adminMessage && adminMessage.trim() !== "") {
      extraMessageToCustomer = `
    <div style="margin-top: 20px; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">
      <p><strong>📩 Meddelande från oss:</strong></p>
      <p>${adminMessage}</p>
    </div>
  `;
    }

    let selectedExtras = "";

    if (persienner && parseInt(persienner) > 0) {
      selectedExtras += `<li>Persienner (${persienner} st): ${
        extraPrices.persienner * parseInt(persienner)
      } SEK</li>`;
    }
    if (extraBadrum) {
      selectedExtras += `<li>Extra Badrum: ${extraPrices.extraBadrum} SEK</li>`;
    }
    if (extraToalett) {
      selectedExtras += `<li>Extra Toalett: ${extraPrices.extraToalett} SEK</li>`;
    }
    if (inglasadDuschhörna) {
      selectedExtras += `<li>Inglasad Duschhörna: ${extraPrices.inglasadDuschhörna} SEK</li>`;
    }
    if (insidanMaskiner) {
      if (diskmaskin) {
        selectedExtras += `<li>Diskmaskin: ${extraPrices.diskmaskin} SEK</li>`;
      }
      if (tvattmaskin) {
        selectedExtras += `<li>Tvättmaskin: ${extraPrices.tvattmaskin} SEK</li>`;
      }
      if (torktumlare) {
        selectedExtras += `<li>Torktumlare: ${extraPrices.torktumlare} SEK</li>`;
      }
    }

    // Email Content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5;">
       
        <h2 style="color: #2c3e50;">📌 Bokningsbekräftelse – #${
          orderNumber || customerName
        }</h2>
        <p>Hej <strong>${customerName}</strong>,</p>
        <p>Tack för din bokning hos <strong>Vilöserdet</strong>! Här är detaljerna för din bokning:</p>
        <hr>
        <p><strong>🛠️ Tjänst:</strong> Visningstäd</p>
        <p><strong>📅 Datum:</strong> ${
          new Date(bookingDate).toISOString().split("T")[0]
        } kl:${tid}</p>
        <p><strong>🏡 Adress:</strong> ${address}</p>
         ${
           totalPrice !== 0
             ? `<p><strong>💰 Visningstäd Pris:</strong> ${totalPrice} SEK</p>`
             : ""
         }
         ${
           selectedExtras
             ? `<div><strong>➕ Valda Extra Tjänster:</strong><ul>${selectedExtras}</ul></div><hr>`
             : ""
         }
        <p><strong>💰 Pris:</strong> ${finalTotalPrice} SEK${
      rutChecked ? " (pris efter RUT)" : ""
    }</p>
        ${extraMessageToCustomer}
        <hr>
        <p>Om du behöver ändra eller avboka tiden, vänligen kontakta oss senast tre arbetsdagar innan den avtalade tiden.</p>
        <p>Om du har några frågor eller behöver ändra din bokning, kontakta oss på:</p>
        <p>📧 <a href="mailto:info@viloserdet.se">info@viloserdet.se </a> | 📞 010-555 88 93</p>
        <p>📄 Genom att boka godkänner du våra <a href="https://www.vilöserdet.se/Ingarivisningsstadning" target="_blank" style="color: #0D3F53; text-decoration: underline;">avtalsvillkor</a>.</p>
        <p>Med vänliga hälsningar,</p>
        <p><strong>Orgnummer: </strong>880531–7958 </p>
        <p><strong>Telefon: </strong>010-555 88 93</p>
        <p><strong>Vilöserdet</strong></p>
        <div style="text-align: left; margin-bottom: 20px;">
          <img src="https://www.vilöserdet.se/logoScroll.svg" alt="Vilöserdet Logo" style="max-width: 200px; height: auto;">
        </div>
      </div>
    `;

    await sendEmail(
      customerEmail,
      `Bokningsbekräftelse – #${orderNumber || customerName}`,
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

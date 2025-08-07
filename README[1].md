# JMB Printing Services - Loyalty Card Registration System

This project is a multi-step loyalty card registration system for JMB PRINTING SERVICES, built in HTML, Tailwind CSS, and JavaScript.

## 📁 Project Structure

- `index.html` – The main landing page and registration UI
- `scripts.js` – External JavaScript for form steps, validation, photo/signature processing, and email generation
- `README.md` – This file

## 🚀 Features

- Multi-step form with animated transitions
- Photo upload and optimization for ID printing
- Signature capture using canvas
- Email simulation via `mailto:` links
- Success modal with reference ID

## ✅ Usage

1. Open `index.html` in your browser
2. Click **"Get Your Loyalty Card Now"**
3. Complete the 4 steps:
   - Enter personal details
   - Upload photo
   - Sign
   - Review and submit
4. Email will auto-open (simulated) for admin and confirmation message for customer

## 🔐 Note

This version is frontend-only. To fully enable:
- **Real email sending**: Use EmailJS or Firebase Functions
- **Data storage**: Connect Firebase Firestore + Storage

## 📧 Business Email Setup

Update this line in `scripts.js` with your email:
```js
const mailtoLink = `mailto:jmbprintingservices12@gmail.com?...`;
```

## 🔨 Future Add-ons

- Firebase backend (save form data, photo, signature)
- Loyalty card ID auto generation
- PDF export of the digital card

---

**Made for JMB Printing Services** – High Quality Prints!
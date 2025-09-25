'use server';

import { Resend } from "resend";
import { PDFDocument, rgb } from "pdf-lib";
import * as fontkit from "fontkit";
import fs from "fs";
import path from "path";

const resend = new Resend(process.env.RESEND_API_KEY as string);

interface BaseBooking {
  id: string;
  amount: number;
  departureDate: string;
}

export interface DestinationBooking extends BaseBooking {
  type: "destination";
  destinationName: string;
}

export interface ItineraryBooking extends BaseBooking {
  type: "itinerary";
  itineraryTitle: string;
}

export type Booking = DestinationBooking | ItineraryBooking;

export interface EmailPayload {
  name: string;
  email: string;
  type: "destination" | "itinerary";
  booking: Booking;
}

/**
 * Generate a branded PDF invoice/receipt
 */
async function generateReceiptPDF({ name, email, type, booking }: EmailPayload): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // ✅ Load font (for ₱ support)
  const fontBytes = fs.readFileSync(path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf"));
  const font = await pdfDoc.embedFont(fontBytes);

  const page = pdfDoc.addPage([600, 750]);
  const { height } = page.getSize();
  let y = height - 50;

  // ✅ Logo
  try {
    const logoPath = path.join(process.cwd(), "public/images/luwas-logo.png");
    const logoBytes = fs.readFileSync(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);
    page.drawImage(logoImage, { x: 50, y: y - 60, width: 70, height: 70 });
  } catch {
    console.warn("⚠️ Could not load logo for PDF");
  }

  // ✅ Title
  page.drawText("MDCC Travel & Tours", {
    x: 140,
    y: y - 20,
    size: 18,
    font,
    color: rgb(0.1, 0.2, 0.6),
  });
  page.drawText("Booking Receipt", { x: 140, y: y - 45, size: 14, font });

  y -= 100;

  // ✅ Table header background
  page.drawRectangle({
    x: 50,
    y: y - 5,
    width: 500,
    height: 20,
    color: rgb(0.1, 0.2, 0.6),
  });

  // ✅ Headers
  const headers = ["QTY", "Description", "Unit Price", "Amount"];
  const colX = [60, 120, 360, 460];
  headers.forEach((h, i) => {
    page.drawText(h, {
      x: colX[i],
      y,
      size: 12,
      font,
      color: rgb(1, 1, 1),
    });
  });

  y -= 30;

  // ✅ Booking row
  const tripName =
    type === "destination"
      ? (booking as DestinationBooking).destinationName
      : (booking as ItineraryBooking).itineraryTitle;

  page.drawText("1", { x: colX[0], y, size: 12, font });
  page.drawText(tripName, { x: colX[1], y, size: 12, font });
  page.drawText(`₱${Number(booking.amount).toLocaleString()}`, {
    x: colX[2],
    y,
    size: 12,
    font,
  });
  page.drawText(`₱${Number(booking.amount).toLocaleString()}`, {
    x: colX[3],
    y,
    size: 12,
    font,
  });

  y -= 50;

  // ✅ Totals
  page.drawText("Total Paid:", { x: 360, y, size: 12, font });
  page.drawText(`₱${Number(booking.amount).toLocaleString()}`, {
    x: 460,
    y,
    size: 12,
    font,
    color: rgb(0.1, 0.2, 0.6),
  });

  // ✅ Footer
  page.drawText("Thank you for booking with MDCC Travel & Tours.", {
    x: 60,
    y: 80,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString("base64");
}

/**
 * Send Email with HTML + PDF Receipt
 */
export async function sendReceiptEmail(payload: EmailPayload) {
  const { name, email, type, booking } = payload;

  const base64PDF = await generateReceiptPDF(payload);

  const tripName =
    type === "destination"
      ? (booking as DestinationBooking).destinationName
      : (booking as ItineraryBooking).itineraryTitle;

  // ✅ Email HTML
  const html = `
    <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;padding:24px;border:1px solid #eee;border-radius:10px;background:#fff;">
      <div style="text-align:center;margin-bottom:20px;">
        <img src="${process.env.NEXT_PUBLIC_SITE_URL}/images/luwas-logo.png" alt="MDCC Travel & Tours" style="height:60px;margin-bottom:10px;" />
        <h2 style="color:#0d47a1;margin:0;">Booking Receipt</h2>
      </div>

      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for booking with <strong>MDCC Travel & Tours</strong>. Below are your booking details:</p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr style="background:#f4f6f8;">
          <td style="padding:10px;font-weight:bold;">Booking ID</td>
          <td style="padding:10px;">${booking.id}</td>
        </tr>
        <tr>
          <td style="padding:10px;font-weight:bold;">Booking Type</td>
          <td style="padding:10px;">${type}</td>
        </tr>
        <tr style="background:#f4f6f8;">
          <td style="padding:10px;font-weight:bold;">Destination</td>
          <td style="padding:10px;">${tripName}</td>
        </tr>
        <tr>
          <td style="padding:10px;font-weight:bold;">Travel Date</td>
          <td style="padding:10px;">${booking.departureDate}</td>
        </tr>
        <tr style="background:#f4f6f8;">
          <td style="padding:10px;font-weight:bold;">Amount Paid</td>
          <td style="padding:10px;color:#0d47a1;font-weight:bold;">₱${Number(
            booking.amount ?? 0
          ).toLocaleString()}</td>
        </tr>
      </table>

      <p>If you have any questions, reply to this email and we’ll be happy to help.</p>

      <p style="margin-top:20px;">Bon voyage!<br/>– MDCC Travel & Tours</p>

      <hr style="margin-top:30px;" />
      <p style="font-size:12px;color:#888;text-align:center;">This is an automated receipt from MDCC Travel & Tours.</p>
    </div>
  `;

  // ✅ Send via Resend
  await resend.emails.send({
    from: "MDCC Travel <onboarding@resend.dev>",
    to: email,
    subject: `MDCC Travel Receipt — ${tripName}`,
    html,
    attachments: [
      {
        filename: "mdcc_receipt.pdf",
        content: base64PDF,
      },
    ],
  });

  console.log(`✅ Receipt (email + PDF) sent to ${email}`);
}

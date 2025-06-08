'use server';

import sgMail from '@sendgrid/mail';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

interface BaseBooking {
  id: string;
  amount: number;
  departureDate: string;
}

export interface DestinationBooking extends BaseBooking {
  type: 'destination';
  destinationName: string;
  amount: number; 
}

export interface ItineraryBooking extends BaseBooking {
  type: 'itinerary';
  itineraryTitle: string;
  amount: number; 
}

export type Booking = DestinationBooking | ItineraryBooking;

export interface EmailPayload {
  name: string;
  email: string;
  type: 'destination' | 'itinerary';
  booking: Booking;
}


export async function sendReceiptEmail({
  name,
  email,
  type,
  booking,
}: EmailPayload) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { height } = page.getSize();
  const fontSize = 14;
  let y = height - 40;

  const lines = [
    'MDCC Travel & Tours — Booking Receipt',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Booking Type: ${type}`,
    `Destination: ${
      type === 'destination'
        ? (booking as DestinationBooking).destinationName
        : (booking as ItineraryBooking).itineraryTitle
    }`,
    `Amount Paid: PHP ${booking.amount}`,
    `Travel Date: ${booking.departureDate}`,
  ];

  for (const line of lines) {
    page.drawText(line, {
      x: 50,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    y -= 24;
  }

  const pdfBytes = await pdfDoc.save();
  const base64PDF = Buffer.from(pdfBytes).toString('base64');

  const tripName =
    type === 'destination'
      ? (booking as DestinationBooking).destinationName
      : (booking as ItineraryBooking).itineraryTitle;

  const logoUrl = 'public/images/luwas-logo.jpg';

  const html = `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #eee; border-radius: 10px; padding: 24px; background: #fff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${logoUrl}" alt="MDCC Travel and Tours" style="width: 100px; margin-bottom: 10px;" />
        <h2 style="color: #e06a00;">Your Booking Confirmation</h2>
      </div>

      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for booking with <strong>MDCC Travel & Tours</strong>. Your reservation has been confirmed. Please find your official receipt attached as a PDF.</p>

      <hr style="margin: 20px 0;" />

      <table style="width: 100%; font-size: 14px; line-height: 1.6;">
        <tr>
          <td><strong>Booking ID:</strong></td>
          <td>${booking.id}</td>
        </tr>
        <tr>
          <td><strong>Booking Type:</strong></td>
          <td>${type}</td>
        </tr>
        <tr>
          <td><strong>Destination:</strong></td>
          <td>${tripName}</td>
        </tr>
        <tr>
          <td><strong>Travel Date:</strong></td>
          <td>${booking.departureDate}</td>
        </tr>
        <tr>
          <td><strong>Amount Paid:</strong></td>
          <td>₱${Number(booking.amount ?? 0).toLocaleString()}</td>
        </tr>
      </table>

      <p style="margin-top: 30px;">If you have any questions, just reply to this email and we’ll be happy to help.</p>

      <p style="margin-top: 20px;">Bon voyage!<br/>– MDCC Travel & Tours 🌴</p>

      <hr style="margin-top: 40px;" />
      <p style="text-align: center; font-size: 12px; color: #888;">This is an automated receipt from MDCC Travel & Tours.</p>
    </div>
  `;

  const msg = {
    to: email,
    from: 'info.luwas@gmail.com', // This must be verified in SendGrid
    subject: `MDCC Travel Receipt — ${tripName}`,
    html,
    attachments: [
      {
        content: base64PDF,
        filename: 'mdcc_receipt.pdf',
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
  };

  await sgMail.send(msg);
}

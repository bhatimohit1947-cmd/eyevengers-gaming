import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Voucher } from '../types';
import { SHOWROOM_INFO } from '../theme';

export async function generateVoucherPdfBlob(voucher: Voucher): Promise<Blob> {
  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(
    `${process.env.NEXT_PUBLIC_APP_URL || 'https://eyevengers.com'}/staff/redeem?token=${voucher.qrToken}`,
    {
      width: 250,
      margin: 1,
      color: {
        dark: '#21171A',
        light: '#FFFFFF',
      },
    }
  );

  // Landscape ticket format: 200mm x 90mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [200, 95],
  });

  // Background - Deep Maroon
  doc.setFillColor(33, 23, 26); // #21171A
  doc.rect(0, 0, 200, 95, 'F');

  // Decorative Inner Border - Antique Gold
  doc.setDrawColor(232, 196, 119); // #E8C477
  doc.setLineWidth(0.8);
  doc.rect(4, 4, 192, 87);

  doc.setDrawColor(201, 59, 59); // #C93B3B
  doc.setLineWidth(0.3);
  doc.rect(6, 6, 188, 83);

  // Header Banner
  doc.setFillColor(104, 31, 43); // #681F2B
  doc.rect(7, 7, 186, 16, 'F');

  doc.setTextColor(255, 241, 207);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EYEVENGERS - FESTIVE REWARDS VOUCHER', 12, 16);

  doc.setTextColor(232, 196, 119);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Jodhpur, Rajasthan • Official Optical Showroom', 12, 20);

  // Ticket Code Badge (Right of header)
  doc.setFillColor(232, 196, 119);
  doc.roundedRect(140, 9, 48, 12, 2, 2, 'F');
  doc.setTextColor(33, 23, 26);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(voucher.voucherCode, 144, 17);

  // Perforated Divider line (Dashed)
  doc.setDrawColor(232, 196, 119);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(135, 25, 135, 87);
  doc.setLineDashPattern([], 0); // reset

  // Left Section: Reward & Customer Details
  doc.setTextColor(255, 81, 73); // Coral
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(voucher.campaignName.toUpperCase(), 12, 29);

  // Reward Title
  doc.setTextColor(255, 244, 227); // Cream
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(voucher.rewardName, 12, 37);

  // Value Tag
  doc.setTextColor(232, 196, 119);
  doc.setFontSize(11);
  doc.text(`Reward Value: ${voucher.rewardValueDisplay}`, 12, 44);

  // Customer Details Block
  doc.setFillColor(42, 23, 29);
  doc.roundedRect(12, 48, 115, 18, 1, 1, 'F');

  doc.setTextColor(232, 196, 119);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('BENEFICIARY:', 15, 54);
  doc.text('MOBILE:', 15, 60);

  doc.setTextColor(255, 244, 227);
  doc.setFont('helvetica', 'normal');
  doc.text(voucher.customerName, 42, 54);
  doc.text(voucher.customerMobile || 'Registered Customer', 42, 60);

  doc.setTextColor(232, 196, 119);
  doc.text('VALID TILL:', 75, 60);
  doc.setTextColor(255, 81, 73);
  doc.setFont('helvetica', 'bold');
  doc.text(new Date(voucher.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 92, 60);

  // Terms & Showroom Info at bottom
  doc.setTextColor(180, 160, 150);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Terms: ${voucher.terms.substring(0, 95)}...`, 12, 72);
  doc.text(`Showroom: ${SHOWROOM_INFO.addressLine} | Ph: ${SHOWROOM_INFO.phone}`, 12, 77);
  doc.text('Present this digital voucher QR at checkout counter for instant deduction.', 12, 82);

  // Right Section: QR Code & Showroom Scan
  doc.addImage(qrDataUrl, 'PNG', 143, 28, 42, 42);

  doc.setTextColor(232, 196, 119);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('SCAN FOR REDEMPTION', 145, 75);

  doc.setTextColor(200, 190, 180);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Showroom Desk Only', 143, 80);

  return doc.output('blob');
}

const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

/**
 * Generate a PDF donation certificate
 */
async function generateCertificate(donationData) {
  const {
    donation,
    restaurant,
    ngo,
    volunteer,
    assignment
  } = donationData;

  const certificateId = `FL-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;
  const generatedAt = new Date().toISOString();

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    const buffers = [];
    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve({ buffer: Buffer.concat(buffers), certificateId }));
    doc.on('error', reject);

    // Background gradient (simulated with rect)
    doc.rect(0, 0, 842, 595).fill('#0f172a');
    doc.rect(0, 0, 842, 8).fill('#22c55e');
    doc.rect(0, 587, 842, 8).fill('#22c55e');

    // Certificate border
    doc.rect(20, 20, 802, 555).stroke('#22c55e').lineWidth(2);
    doc.rect(25, 25, 792, 545).stroke('#166534').lineWidth(1);

    // Header
    doc.fillColor('#22c55e').fontSize(28).font('Helvetica-Bold')
      .text('FoodLink AI', 0, 60, { align: 'center' });

    doc.fillColor('#86efac').fontSize(12).font('Helvetica')
      .text('AI Powered Smart Food Redistribution Platform', 0, 95, { align: 'center' });

    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
      .text('CERTIFICATE OF FOOD DONATION', 0, 135, { align: 'center' });

    // Divider
    doc.moveTo(100, 170).lineTo(742, 170).stroke('#22c55e').lineWidth(1);

    // Certificate body
    doc.fillColor('#d1fae5').fontSize(13).font('Helvetica')
      .text('This certificate is proudly presented to', 0, 185, { align: 'center' });

    doc.fillColor('#22c55e').fontSize(20).font('Helvetica-Bold')
      .text(restaurant?.name || 'Restaurant', 0, 205, { align: 'center' });

    doc.fillColor('#d1fae5').fontSize(13).font('Helvetica')
      .text('for their generous food donation that made a difference in our community.', 0, 235, { align: 'center' });

    // Details table
    const tableY = 270;
    const col1 = 80;
    const col2 = 280;
    const col3 = 480;
    const col4 = 680;

    doc.fillColor('#86efac').fontSize(10).font('Helvetica-Bold');
    doc.text('FOOD DONATED', col1, tableY);
    doc.text('QUANTITY', col2, tableY);
    doc.text('RECIPIENT NGO', col3, tableY);
    doc.text('VOLUNTEER', col4, tableY);

    doc.fillColor('#ffffff').fontSize(11).font('Helvetica');
    doc.text(donation?.food_name || 'Food', col1, tableY + 20, { width: 180 });
    doc.text(`${donation?.quantity || ''} - ${donation?.servings || ''} servings`, col2, tableY + 20, { width: 180 });
    doc.text(ngo?.name || 'NGO', col3, tableY + 20, { width: 180 });
    doc.text(volunteer?.name || 'Volunteer', col4, tableY + 20, { width: 140 });

    // Second row
    doc.fillColor('#86efac').fontSize(10).font('Helvetica-Bold');
    doc.text('DELIVERY DATE', col1, tableY + 60);
    doc.text('CERTIFICATE ID', col2, tableY + 60);
    doc.text('IMPACT', col3, tableY + 60);

    doc.fillColor('#ffffff').fontSize(11).font('Helvetica');
    doc.text(new Date(assignment?.delivered_at || generatedAt).toLocaleDateString('en-IN'), col1, tableY + 80);
    doc.text(certificateId, col2, tableY + 80, { width: 180 });
    doc.text(`${donation?.servings || 0} meals saved from waste`, col3, tableY + 80, { width: 200 });

    // SDG badges
    const badgeY = 420;
    doc.rect(col1, badgeY, 160, 40).fill('#166534').stroke('#22c55e');
    doc.fillColor('#22c55e').fontSize(9).font('Helvetica-Bold')
      .text('🌱 SDG 2 – ZERO HUNGER', col1 + 10, badgeY + 8, { width: 140, align: 'center' });
    doc.fillColor('#d1fae5').fontSize(8)
      .text('End hunger, achieve food security', col1 + 10, badgeY + 22, { width: 140, align: 'center' });

    doc.rect(col1 + 180, badgeY, 200, 40).fill('#1e3a5f').stroke('#3b82f6');
    doc.fillColor('#60a5fa').fontSize(9).font('Helvetica-Bold')
      .text('♻️ SDG 12 – RESPONSIBLE CONSUMPTION', col1 + 190, badgeY + 8, { width: 180, align: 'center' });
    doc.fillColor('#bfdbfe').fontSize(8)
      .text('Sustainable consumption and production', col1 + 190, badgeY + 22, { width: 180, align: 'center' });

    // Footer
    doc.moveTo(100, 480).lineTo(742, 480).stroke('#22c55e').lineWidth(1);
    doc.fillColor('#6b7280').fontSize(9).font('Helvetica')
      .text(`Generated on ${new Date(generatedAt).toLocaleString()} | FoodLink AI Platform | Reducing Food Waste, Fighting Hunger`, 0, 490, { align: 'center' });
    doc.fillColor('#374151').fontSize(8)
      .text('⚠️ This certificate is for donation record purposes only and does not constitute a food safety certification.', 0, 510, { align: 'center' });

    doc.end();
  });
}

module.exports = { generateCertificate };

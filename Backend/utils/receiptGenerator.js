import PDFDocument from 'pdfkit';

export const generateReceiptPDF = async (payment) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50,
        info: {
          Title: `Payment Receipt - ${payment.receiptNumber}`,
          Author: 'Boardmate System',
          Subject: `Receipt for ${payment.tenant.firstName} ${payment.tenant.lastName}`,
          Creator: 'Boardmate Backend',
          Producer: 'Boardmate System'
        }
      });

      const chunks = [];

      // Collect PDF data
      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });

      doc.on('error', (error) => {
        reject(error);
      });

      // PDF Content Generation
      generateReceiptContent(doc, payment);

      // Finalize the PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const generateReceiptContent = (doc, payment) => {
  const pageWidth = doc.page.width;
  const margin = doc.page.margins.left;
  const contentWidth = pageWidth - (margin * 2);

  // Header
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text('PAYMENT RECEIPT', margin, 50, { align: 'center' });

  // Company/System Info
  doc.fontSize(12)
     .font('Helvetica')
     .text('Boardmate Management System', margin, 90, { align: 'center' })
     .text(`Receipt #: ${payment.receiptNumber}`, margin, 110, { align: 'center' })
     .text(`Issue Date: ${new Date().toLocaleDateString()}`, margin, 125, { align: 'center' });

  // Draw a line
  doc.strokeColor('#cccccc')
     .lineWidth(1)
     .moveTo(margin, 150)
     .lineTo(pageWidth - margin, 150)
     .stroke();

  let yPosition = 170;

  // Tenant Information
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('TENANT INFORMATION', margin, yPosition);

  yPosition += 25;
  doc.fontSize(11)
     .font('Helvetica')
     .text(`Name: ${payment.tenant.firstName} ${payment.tenant.lastName}`, margin, yPosition)
     .text(`Email: ${payment.tenant.email}`, margin, yPosition + 15)
     .text(`Phone: ${payment.tenant.phoneNumber}`, margin, yPosition + 30);

  // Tenant Address (if available)
  if (payment.tenant.address && payment.tenant.address.street) {
    const address = [
      payment.tenant.address.street,
      payment.tenant.address.city,
      payment.tenant.address.province,
      payment.tenant.address.zipCode
    ].filter(Boolean).join(', ');
    
    doc.text(`Address: ${address}`, margin, yPosition + 45);
    yPosition += 15;
  }

  yPosition += 60;

  // Room Information
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('ROOM INFORMATION', margin, yPosition);

  yPosition += 25;
  doc.fontSize(11)
     .font('Helvetica')
     .text(`Room Number: ${payment.room.roomNumber}`, margin, yPosition)
     .text(`Room Type: ${payment.room.roomType.charAt(0).toUpperCase() + payment.room.roomType.slice(1)}`, margin, yPosition + 15);

  if (payment.room.floor !== undefined) {
    doc.text(`Floor: ${payment.room.floor}`, margin, yPosition + 30);
    yPosition += 15;
  }

  yPosition += 60;

  // Payment Details
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('PAYMENT DETAILS', margin, yPosition);

  yPosition += 25;

  // Payment info table-like structure
  const leftColumn = margin;
  const rightColumn = margin + 200;

  doc.fontSize(11)
     .font('Helvetica')
     .text('Payment Type:', leftColumn, yPosition)
     .text(payment.paymentType.charAt(0).toUpperCase() + payment.paymentType.slice(1), rightColumn, yPosition);

  yPosition += 18;
  doc.text('Payment Method:', leftColumn, yPosition)
     .text(payment.paymentMethod.replace('_', ' ').toUpperCase(), rightColumn, yPosition);

  yPosition += 18;
  doc.text('Payment Date:', leftColumn, yPosition)
     .text(payment.paymentDate.toLocaleDateString(), rightColumn, yPosition);

  yPosition += 18;
  doc.text('Due Date:', leftColumn, yPosition)
     .text(payment.dueDate.toLocaleDateString(), rightColumn, yPosition);

  // Period Covered (if available)
  if (payment.periodCovered && payment.periodCovered.startDate) {
    yPosition += 18;
    const startDate = new Date(payment.periodCovered.startDate).toLocaleDateString();
    const endDate = payment.periodCovered.endDate 
      ? new Date(payment.periodCovered.endDate).toLocaleDateString()
      : 'Ongoing';
    
    doc.text('Period Covered:', leftColumn, yPosition)
       .text(`${startDate} - ${endDate}`, rightColumn, yPosition);
  }

  // Transaction Reference (if available)
  if (payment.transactionReference) {
    yPosition += 18;
    doc.text('Transaction Ref:', leftColumn, yPosition)
       .text(payment.transactionReference, rightColumn, yPosition);
  }

  yPosition += 35;

  // Amount breakdown
  doc.strokeColor('#cccccc')
     .lineWidth(1)
     .moveTo(margin, yPosition)
     .lineTo(pageWidth - margin, yPosition)
     .stroke();

  yPosition += 20;

  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('AMOUNT BREAKDOWN', margin, yPosition);

  yPosition += 25;

  // Payment amount
  doc.fontSize(11)
     .font('Helvetica')
     .text('Payment Amount:', leftColumn, yPosition)
     .text(`₱${payment.amount.toFixed(2)}`, rightColumn, yPosition);

  // Late fee (if any)
  if (payment.lateFee && payment.lateFee.amount > 0) {
    yPosition += 18;
    doc.text('Late Fee:', leftColumn, yPosition)
       .text(`₱${payment.lateFee.amount.toFixed(2)}`, rightColumn, yPosition);
    
    if (payment.lateFee.reason) {
      yPosition += 15;
      doc.fontSize(9)
         .text(`Late Fee Reason: ${payment.lateFee.reason}`, margin, yPosition);
    }
  }

  yPosition += 25;

  // Total amount
  doc.strokeColor('#000000')
     .lineWidth(2)
     .moveTo(leftColumn, yPosition)
     .lineTo(pageWidth - margin, yPosition)
     .stroke();

  yPosition += 15;

  const totalAmount = payment.amount + (payment.lateFee?.amount || 0);
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('TOTAL PAID:', leftColumn, yPosition)
     .text(`₱${totalAmount.toFixed(2)}`, rightColumn, yPosition);

  // Description and Notes
  if (payment.description || payment.notes) {
    yPosition += 40;
    
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('ADDITIONAL INFORMATION', margin, yPosition);
    
    yPosition += 20;
    
    if (payment.description) {
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Description: ${payment.description}`, margin, yPosition, {
           width: contentWidth,
           align: 'left'
         });
      yPosition += 25;
    }
    
    if (payment.notes) {
      doc.fontSize(10)
         .text(`Notes: ${payment.notes}`, margin, yPosition, {
           width: contentWidth,
           align: 'left'
         });
      yPosition += 25;
    }
  }

  // Footer
  yPosition = doc.page.height - 120; // Position from bottom

  doc.strokeColor('#cccccc')
     .lineWidth(1)
     .moveTo(margin, yPosition)
     .lineTo(pageWidth - margin, yPosition)
     .stroke();

  yPosition += 20;

  // Recorded by (if available)
  if (payment.recordedBy) {
    doc.fontSize(9)
       .font('Helvetica')
       .text(`Recorded by: ${payment.recordedBy.name} (${payment.recordedBy.role})`, margin, yPosition);
  }

  doc.fontSize(9)
     .text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition + 15)
     .text('This is a computer-generated receipt.', margin, yPosition + 30, { align: 'center' });

  // Status stamp
  doc.fontSize(18)
     .font('Helvetica-Bold')
     .fillColor('#009900')
     .text('PAID', pageWidth - margin - 60, 200, { 
       align: 'center',
       width: 60
     });

  // Draw border around PAID
  doc.rect(pageWidth - margin - 70, 195, 80, 30)
     .strokeColor('#009900')
     .lineWidth(2)
     .stroke();
};
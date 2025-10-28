import PDFDocument from 'pdfkit';
export const generateContractPDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const chunks = [];
      const doc = new PDFDocument({ 
        size: 'LETTER',
        margins: { top: 72, bottom: 72, left: 72, right: 72 }
      });

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        const base64String = pdfBuffer.toString('base64');
        resolve(`data:application/pdf;base64,${base64String}`);
      });
      doc.on('error', reject);

      const startDate = new Date(data.leaseStartDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + data.leaseDurationMonths);

      doc.fontSize(16).font('Helvetica-Bold')
        .text('RESIDENTIAL LEASE AGREEMENT', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica')
        .text(`Date of Agreement: ${new Date(data.contractDate || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('1. PARTIES');
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.3)
        .text(`This Residential Lease Agreement ("Agreement") is entered into between:`)
        .moveDown(0.3)
        .font('Helvetica-Bold').text('LANDLORD:')
        .font('Helvetica')
        .text(`Name: ${data.landlordName}`)
        .text(`Address: ${data.landlordAddress}`)
        .moveDown(0.5)
        .font('Helvetica-Bold').text('TENANT:')
        .font('Helvetica')
        .text(`Name: ${data.tenantName}`)
        .text(`Email: ${data.tenantEmail}`)
        .text(`Phone: ${data.tenantPhone}`)
        .text(`Address: ${data.tenantAddress || 'As provided'}`)
        .moveDown(1);

      doc.addPage();
      doc.fontSize(12).font('Helvetica-Bold').text('2. PROPERTY DESCRIPTION');
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.3)
        .text(`The Landlord hereby leases to the Tenant the following premises:`)
        .moveDown(0.5)
        .font('Helvetica-Bold').text('Property Details:')
        .font('Helvetica')
        .text(`Room Number: ${data.roomNumber}`)
        .text(`Room Type: ${data.roomType.charAt(0).toUpperCase() + data.roomType.slice(1)}`)
        .text(`Property Address: ${data.landlordAddress}`)
        .moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('3. LEASE TERM');
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.3)
        .text(`The lease term shall be ${data.leaseDurationMonths} month(s) commencing on ${startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} and ending on ${endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`)
        .moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('4. RENT PAYMENT');
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.3)
        .text(`Monthly Rent: ₱${parseFloat(data.monthlyRent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
        .text(`Due Date: 5th of each month`)
        .text(`Payment Method: Cash or Bank Transfer`)
        .moveDown(0.5)
        .font('Helvetica-Bold').text('Late Fees:')
        .font('Helvetica')
        .text(`If rent is not received by the 10th of the month, a late fee of ₱500.00 will be charged.`)
        .moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('5. SECURITY DEPOSIT');
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.3)
        .text(`The Tenant has paid a security deposit of ₱${parseFloat(data.securityDeposit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} which shall be held by the Landlord as security for the faithful performance by the Tenant of all obligations under this Agreement.`)
        .moveDown(0.5)
        .text(`The security deposit will be returned within 30 days after the termination of this Agreement, less any deductions for damages or unpaid rent.`)
        .moveDown(1);

      doc.addPage();

      doc.fontSize(12).font('Helvetica-Bold').text('6. USE OF PREMISES');
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.3)
        .text(`The premises shall be used solely for residential purposes. The Tenant shall not use the premises for any commercial, illegal, or improper purpose.`)
        .moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('7. OCCUPANCY LIMIT');
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.3)
        .text(`Maximum occupancy for this room: ${data.roomCapacity} person(s). The Tenant shall not allow additional persons to occupy the premises without the Landlord's prior written consent.`)
        .moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('8. UTILITIES AND SERVICES');
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.3)
        .text(`The Landlord shall provide the following utilities and services:`)
        .text(`• Electricity`)
        .text(`• Water`)
        .text(`• Basic maintenance of common areas`)
        .text(`• Wi-Fi internet access`)
        .moveDown(0.5)
        .text(`The Tenant is responsible for the following:`)
        .text(`• Excessive utility usage beyond normal residential use`)
        .text(`• Cable or satellite television (if desired)`)
        .moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('9. HOUSE RULES AND REGULATIONS');
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.3)
        .text(`The Tenant agrees to abide by the following rules:`)
        .moveDown(0.3)
        .text(`(a) Quiet hours: 10:00 PM to 6:00 AM`)
        .text(`(b) No smoking inside the premises`)
        .text(`(c) No pets allowed without written consent`)
        .text(`(d) Visitors must comply with security regulations`)
        .text(`(e) No illegal activities on the premises`)
        .text(`(f) Keep common areas clean and accessible`)
        .text(`(g) No loud noise or disturbances to neighbors`)
        .moveDown(1);

      doc.addPage();

      doc.fontSize(12).font('Helvetica-Bold').text('10. MAINTENANCE AND REPAIRS');
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.3)
        .text(`The Landlord is responsible for:`)
        .text(`• Structural repairs and maintenance`)
        .text(`• Electrical, plumbing, and HVAC systems`)
        .text(`• Common area maintenance`)
        .moveDown(0.5)
        .text(`The Tenant is responsible for:`)
        .text(`• Minor repairs and maintenance`)
        .text(`• Keeping the premises in clean and sanitary condition`)
        .text(`• Replacing light bulbs and batteries`)
        .text(`• Reporting major maintenance issues promptly`)
        .moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('11. ALTERATIONS');
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.3)
        .text(`The Tenant shall not make any alterations, additions, or improvements to the premises without the Landlord's prior written consent. Any approved alterations become the property of the Landlord unless otherwise agreed.`)
        .moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('12. ENTRY BY LANDLORD');
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.3)
        .text(`The Landlord may enter the premises at reasonable times for inspection, repairs, or to show the property to prospective tenants. The Landlord will provide at least 24 hours notice except in case of emergency.`)
        .moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('13. TERMINATION');
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.3)
        .text(`Either party may terminate this Agreement by giving 30 days written notice. If the Tenant terminates early without cause, the Landlord may retain the security deposit as liquidated damages.`)
        .moveDown(1);

      doc.fontSize(12).font('Helvetica-Bold').text('14. DEFAULT AND REMEDIES');
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.3)
        .text(`If the Tenant fails to pay rent or violates any terms of this Agreement, the Landlord may terminate the lease and take legal action to recover damages and possession of the premises.`)
        .moveDown(1);

      doc.addPage();

      if (data.specialTerms && data.specialTerms.trim()) {
        doc.fontSize(12).font('Helvetica-Bold').text('15. SPECIAL TERMS AND CONDITIONS');
        doc.fontSize(10).font('Helvetica')
          .moveDown(0.3)
          .text(data.specialTerms)
          .moveDown(1);
      }

      doc.fontSize(12).font('Helvetica-Bold').text('16. ENTIRE AGREEMENT');
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.3)
        .text(`This Agreement constitutes the entire agreement between the parties and supersedes all prior agreements. No modification shall be binding unless in writing and signed by both parties.`)
        .moveDown(2);

      doc.fontSize(12).font('Helvetica-Bold').text('SIGNATURES');
      doc.moveDown(1);

      doc.font('Helvetica').fontSize(10)
        .text('LANDLORD:', { continued: true })
        .text(` _________________________`, { underline: true })
        .moveDown(1)
        .text('Signature')
        .moveDown(1)
        .font('Helvetica')
        .text(data.landlordName)
        .text('Date: _______________')
        .moveDown(2)
        .text('TENANT:', { continued: true })
        .text(` _________________________`, { underline: true })
        .moveDown(1)
        .text('Signature')
        .moveDown(1)
        .text(data.tenantName)
        .text('Date: _______________');

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};


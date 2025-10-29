import jsPDF from 'jspdf';

interface PaymentReceipt {
  id: string;
  description: string;
  amount: string;
  dueDate: string;
  paidDate?: string;
  status: string;
  paymentMethod?: string;
  transactionReference?: string;
  notes?: string;
  tenantName?: string;
  roomNumber?: string;
}

export const generateReceiptPDF = (payment: PaymentReceipt) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', pageWidth / 2, 20, { align: 'center' });
  
  // Receipt ID
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt #: ${payment.id}`, pageWidth / 2, 30, { align: 'center' });
  
  // Divider
  doc.setLineWidth(0.5);
  doc.line(20, 35, pageWidth - 20, 35);
  
  // Payment Details
  let yPos = 45;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Information', 20, yPos);
  
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  // Tenant & Room
  if (payment.tenantName) {
    doc.text(`Tenant:`, 20, yPos);
    doc.text(payment.tenantName, 70, yPos);
    yPos += 7;
  }
  
  if (payment.roomNumber) {
    doc.text(`Room:`, 20, yPos);
    doc.text(payment.roomNumber, 70, yPos);
    yPos += 7;
  }
  
  // Description
  doc.text(`Description:`, 20, yPos);
  doc.text(payment.description, 70, yPos);
  yPos += 7;
  
  // Amount
  doc.setFont('helvetica', 'bold');
  doc.text(`Amount:`, 20, yPos);
  // Format amount properly - use PHP instead of ₱ symbol (jsPDF doesn't support ₱)
  const cleanAmount = payment.amount.replace(/[₱,]/g, '').trim();
  const numAmount = parseFloat(cleanAmount);
  const formattedAmount = `PHP ${numAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  doc.text(formattedAmount, 70, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  
  // Status
  doc.text(`Status:`, 20, yPos);
  doc.text(payment.status.toUpperCase(), 70, yPos);
  yPos += 7;
  
  // Due Date
  doc.text(`Due Date:`, 20, yPos);
  doc.text(payment.dueDate, 70, yPos);
  yPos += 7;
  
  // Paid Date
  if (payment.paidDate) {
    doc.text(`Paid Date:`, 20, yPos);
    doc.text(payment.paidDate, 70, yPos);
    yPos += 7;
  }
  
  // Payment Method
  if (payment.paymentMethod) {
    doc.text(`Payment Method:`, 20, yPos);
    doc.text(payment.paymentMethod, 70, yPos);
    yPos += 7;
  }
  
  // Transaction Reference
  if (payment.transactionReference) {
    doc.text(`Transaction Ref:`, 20, yPos);
    doc.text(payment.transactionReference, 70, yPos);
    yPos += 7;
  }
  
  // Notes
  if (payment.notes) {
    yPos += 3;
    doc.text(`Notes:`, 20, yPos);
    yPos += 7;
    const splitNotes = doc.splitTextToSize(payment.notes, pageWidth - 40);
    doc.text(splitNotes, 20, yPos);
    yPos += splitNotes.length * 5;
  }
  
  // Footer
  yPos += 15;
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  yPos += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer-generated receipt. No signature required.', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  const dateGenerated = new Date().toLocaleString();
  doc.text(`Generated on: ${dateGenerated}`, pageWidth / 2, yPos + 5, { align: 'center' });
  
  // Save the PDF with extraction date for clarity
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  doc.save(`receipt-${payment.id}_${datePart}.pdf`);
};


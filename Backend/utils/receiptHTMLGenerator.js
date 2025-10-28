export const generateReceiptHTML = (payment) => {
  const tenantName = `${payment.tenant.firstName} ${payment.tenant.lastName}`;
  const totalAmount = payment.amount + (payment.lateFee?.amount || 0);
  
  let tenantAddress = '';
  if (payment.tenant.address && payment.tenant.address.street) {
    const address = [
      payment.tenant.address.street,
      payment.tenant.address.city,
      payment.tenant.address.province,
      payment.tenant.address.zipCode
    ].filter(Boolean).join(', ');
    tenantAddress = address;
  }

  let periodCovered = '';
  if (payment.periodCovered && payment.periodCovered.startDate) {
    const startDate = new Date(payment.periodCovered.startDate).toLocaleDateString();
    const endDate = payment.periodCovered.endDate 
      ? new Date(payment.periodCovered.endDate).toLocaleDateString()
      : 'Ongoing';
    periodCovered = `${startDate} - ${endDate}`;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - ${payment.receiptNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            padding: 20px;
        }
        
        .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .receipt-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }
        
        .receipt-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .receipt-subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .receipt-number {
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(255,255,255,0.2);
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 14px;
        }
        
        .receipt-body {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 15px;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 8px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .info-item {
            margin-bottom: 12px;
        }
        
        .info-label {
            font-weight: 600;
            color: #555;
            display: inline-block;
            min-width: 140px;
        }
        
        .info-value {
            color: #333;
        }
        
        .payment-details {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .amount-breakdown {
            background: #fff;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 25px;
            margin: 20px 0;
        }
        
        .amount-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #eee;
        }
        
        .amount-row:last-child {
            border-bottom: none;
            font-size: 18px;
            font-weight: bold;
            color: #27ae60;
            border-top: 2px solid #27ae60;
            margin-top: 10px;
            padding-top: 15px;
        }
        
        .paid-stamp {
            position: absolute;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
            transform: rotate(15deg);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .receipt-footer {
            background: #f8f9fa;
            padding: 20px 40px;
            border-top: 1px solid #dee2e6;
            font-size: 14px;
            color: #6c757d;
        }
        
        .generated-info {
            text-align: center;
            margin-top: 15px;
            font-style: italic;
        }
        
        @media (max-width: 768px) {
            .info-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .receipt-body {
                padding: 20px;
            }
            
            .paid-stamp {
                position: static;
                transform: none;
                display: inline-block;
                margin: 10px 0;
            }
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .receipt-container {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="receipt-header">
            <div class="receipt-number">Receipt #${payment.receiptNumber}</div>
            <h1 class="receipt-title">PAYMENT RECEIPT</h1>
            <p class="receipt-subtitle">Boardmate Management System</p>
            <div class="paid-stamp">PAID</div>
        </div>
        
        <div class="receipt-body">
            <div class="info-grid">
                <div class="tenant-info">
                    <h2 class="section-title">Tenant Information</h2>
                    <div class="info-item">
                        <span class="info-label">Name:</span>
                        <span class="info-value">${tenantName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${payment.tenant.email}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Phone:</span>
                        <span class="info-value">${payment.tenant.phoneNumber}</span>
                    </div>
                    ${tenantAddress ? `
                    <div class="info-item">
                        <span class="info-label">Address:</span>
                        <span class="info-value">${tenantAddress}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="room-info">
                    <h2 class="section-title">Room Information</h2>
                    <div class="info-item">
                        <span class="info-label">Room Number:</span>
                        <span class="info-value">${payment.room.roomNumber}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Room Type:</span>
                        <span class="info-value">${payment.room.roomType.charAt(0).toUpperCase() + payment.room.roomType.slice(1)}</span>
                    </div>
                    ${payment.room.floor !== undefined ? `
                    <div class="info-item">
                        <span class="info-label">Floor:</span>
                        <span class="info-value">${payment.room.floor}</span>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <span class="info-label">Monthly Rent:</span>
                        <span class="info-value">₱${payment.room.monthlyRent.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div class="payment-details">
                <h2 class="section-title">Payment Details</h2>
                <div class="info-grid">
                    <div>
                        <div class="info-item">
                            <span class="info-label">Payment Type:</span>
                            <span class="info-value">${payment.paymentType.charAt(0).toUpperCase() + payment.paymentType.slice(1)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Payment Method:</span>
                            <span class="info-value">${payment.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Payment Date:</span>
                            <span class="info-value">${new Date(payment.paymentDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div>
                        <div class="info-item">
                            <span class="info-label">Due Date:</span>
                            <span class="info-value">${new Date(payment.dueDate).toLocaleDateString()}</span>
                        </div>
                        ${periodCovered ? `
                        <div class="info-item">
                            <span class="info-label">Period Covered:</span>
                            <span class="info-value">${periodCovered}</span>
                        </div>
                        ` : ''}
                        ${payment.transactionReference ? `
                        <div class="info-item">
                            <span class="info-label">Transaction Ref:</span>
                            <span class="info-value">${payment.transactionReference}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                ${payment.description ? `
                <div class="info-item" style="margin-top: 20px;">
                    <span class="info-label">Description:</span>
                    <span class="info-value">${payment.description}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="amount-breakdown">
                <h2 class="section-title">Amount Breakdown</h2>
                <div class="amount-row">
                    <span>Payment Amount:</span>
                    <span>₱${payment.amount.toFixed(2)}</span>
                </div>
                ${payment.lateFee && payment.lateFee.amount > 0 ? `
                <div class="amount-row">
                    <span>Late Fee:</span>
                    <span>₱${payment.lateFee.amount.toFixed(2)}</span>
                </div>
                ${payment.lateFee.reason ? `
                <div style="font-size: 12px; color: #666; margin-top: 5px;">
                    Late Fee Reason: ${payment.lateFee.reason}
                </div>
                ` : ''}
                ` : ''}
                <div class="amount-row">
                    <span>TOTAL PAID:</span>
                    <span>₱${totalAmount.toFixed(2)}</span>
                </div>
            </div>
            
            ${payment.notes ? `
            <div class="section">
                <h2 class="section-title">Notes</h2>
                <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; font-style: italic;">
                    ${payment.notes}
                </p>
            </div>
            ` : ''}
        </div>
        
        <div class="receipt-footer">
            ${payment.recordedBy ? `
            <div>Recorded by: <strong>${payment.recordedBy.name}</strong> (${payment.recordedBy.role})</div>
            ` : ''}
            <div class="generated-info">
                Generated on: ${new Date().toLocaleString()}<br>
                This is a computer-generated receipt.
            </div>
        </div>
    </div>
    
    <script>
        if (window.location.search.includes('print=true')) {
            window.onload = function() {
                window.print();
            };
        }
    </script>
</body>
</html>
  `;
};
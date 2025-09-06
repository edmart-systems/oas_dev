export const purchaseOrderApprovalTemplate = (data: {
  poNumber: string;
  requesterName: string;
  supplierName: string;
  totalAmount: string;
  currency: string;
  approverName: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Purchase Order Approval Required</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            .details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Purchase Order Approval Required</h2>
            </div>
            <div class="content">
                <p>Dear ${data.approverName},</p>
                <p>A new purchase order requires your approval:</p>
                
                <div class="details">
                    <strong>PO Number:</strong> ${data.poNumber}<br>
                    <strong>Requested by:</strong> ${data.requesterName}<br>
                    <strong>Supplier:</strong> ${data.supplierName}<br>
                    <strong>Total Amount:</strong> ${data.currency} ${data.totalAmount}
                </div>
                
                <p>Please review and approve/reject this purchase order at your earliest convenience.</p>
                
                <p>Best regards,<br>Office Automation System</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

export const purchaseOrderIssuedTemplate = (data: {
  poNumber: string;
  supplierName: string;
  supplierEmail: string;
  totalAmount: string;
  currency: string;
  expectedDelivery?: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
}) => {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td>${item.productName}</td>
      <td>${item.quantity}</td>
      <td>${data.currency} ${item.unitPrice}</td>
      <td>${data.currency} ${item.totalPrice}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Purchase Order - ${data.poNumber}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; }
            .content { padding: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f8f9fa; }
            .total { font-weight: bold; background-color: #f8f9fa; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>Purchase Order</h2>
                <h3>${data.poNumber}</h3>
            </div>
            <div class="content">
                <p>Dear ${data.supplierName},</p>
                <p>Please find below our purchase order details:</p>
                
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                        <tr class="total">
                            <td colspan="3"><strong>Total Amount</strong></td>
                            <td><strong>${data.currency} ${data.totalAmount}</strong></td>
                        </tr>
                    </tbody>
                </table>
                
                ${data.expectedDelivery ? `<p><strong>Expected Delivery:</strong> ${data.expectedDelivery}</p>` : ''}
                
                <p>Please confirm receipt of this purchase order and provide delivery timeline.</p>
                
                <p>Best regards,<br>Procurement Team</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please reply to confirm receipt.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
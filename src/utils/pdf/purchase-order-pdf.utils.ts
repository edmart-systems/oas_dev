import puppeteer from 'puppeteer';
import { logger } from '@/logger/default-logger';

export const generatePOPDF = async (po: any): Promise<Buffer> => {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    const htmlContent = generatePOHTML(po);
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    return Buffer.from(pdfBuffer);
  } catch (error) {
    logger.error('Error generating PO PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

const generatePOHTML = (po: any): string => {
  const itemsHtml = po.items.map((item: any, index: number) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.product.product_name}</td>
      <td>${item.description || '-'}</td>
      <td>${item.quantity_ordered}</td>
      <td>${po.currency.currency_code} ${item.unit_price.toFixed(2)}</td>
      <td>${po.currency.currency_code} ${item.total_price.toFixed(2)}</td>
    </tr>
  `).join('');

  const termsHtml = po.termsConditions ? `
    <div class="terms-section">
      <h3>Terms & Conditions</h3>
      <div class="terms-grid">
        <div class="term-item">
          <strong>Validity:</strong> ${po.termsConditions.validity_days} days
          ${po.termsConditions.validity_words ? `(${po.termsConditions.validity_words})` : ''}
        </div>
        ${po.termsConditions.payment_grace_days ? `
          <div class="term-item">
            <strong>Payment Terms:</strong> ${po.termsConditions.payment_grace_days} days
            ${po.termsConditions.payment_words ? `(${po.termsConditions.payment_words})` : ''}
          </div>
        ` : ''}
        <div class="term-item">
          <strong>VAT:</strong> ${po.termsConditions.vat_percentage}%
        </div>
      </div>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Purchase Order - ${po.po_number}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Arial', sans-serif; 
                font-size: 12px; 
                line-height: 1.4; 
                color: #333; 
            }
            .container { width: 100%; max-width: 800px; margin: 0 auto; }
            
            .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #007bff;
                padding-bottom: 20px;
            }
            .header h1 { 
                color: #007bff; 
                font-size: 24px; 
                margin-bottom: 5px; 
            }
            .header h2 { 
                color: #666; 
                font-size: 18px; 
                font-weight: normal; 
            }
            
            .po-info { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 30px; 
            }
            .po-info div { 
                flex: 1; 
                padding: 0 10px; 
            }
            .po-info h3 { 
                color: #007bff; 
                border-bottom: 1px solid #ddd; 
                padding-bottom: 5px; 
                margin-bottom: 10px; 
            }
            
            .items-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 20px; 
            }
            .items-table th, .items-table td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
            }
            .items-table th { 
                background-color: #f8f9fa; 
                font-weight: bold; 
                color: #007bff; 
            }
            .items-table tr:nth-child(even) { 
                background-color: #f9f9f9; 
            }
            
            .total-section { 
                text-align: right; 
                margin-bottom: 30px; 
            }
            .total-amount { 
                font-size: 16px; 
                font-weight: bold; 
                color: #007bff; 
                border: 2px solid #007bff; 
                padding: 10px; 
                display: inline-block; 
                margin-top: 10px; 
            }
            
            .terms-section { 
                margin-bottom: 30px; 
            }
            .terms-section h3 { 
                color: #007bff; 
                border-bottom: 1px solid #ddd; 
                padding-bottom: 5px; 
                margin-bottom: 15px; 
            }
            .terms-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 10px; 
            }
            .term-item { 
                padding: 8px; 
                background-color: #f8f9fa; 
                border-radius: 4px; 
            }
            
            .footer { 
                text-align: center; 
                margin-top: 40px; 
                padding-top: 20px; 
                border-top: 1px solid #ddd; 
                color: #666; 
                font-size: 10px; 
            }
            
            .status-badge { 
                display: inline-block; 
                padding: 4px 8px; 
                border-radius: 4px; 
                font-size: 10px; 
                font-weight: bold; 
                text-transform: uppercase; 
            }
            .status-pending { background-color: #fff3cd; color: #856404; }
            .status-approved { background-color: #d4edda; color: #155724; }
            .status-rejected { background-color: #f8d7da; color: #721c24; }
            .status-issued { background-color: #d1ecf1; color: #0c5460; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>PURCHASE ORDER</h1>
                <h2>${po.po_number}</h2>
                <span class="status-badge status-${po.status.toLowerCase()}">${po.status}</span>
            </div>
            
            <div class="po-info">
                <div>
                    <h3>Supplier Information</h3>
                    <strong>${po.supplier.supplier_name}</strong><br>
                    ${po.supplier.supplier_email || ''}<br>
                    ${po.supplier.supplier_phone || ''}<br>
                    ${po.supplier.supplier_address || ''}
                </div>
                <div>
                    <h3>Order Details</h3>
                    <strong>PO Number:</strong> ${po.po_number}<br>
                    <strong>Date:</strong> ${new Date(po.created_at).toLocaleDateString()}<br>
                    <strong>Requested by:</strong> ${po.requester.firstName} ${po.requester.lastName}<br>
                    ${po.expected_delivery ? `<strong>Expected Delivery:</strong> ${new Date(po.expected_delivery).toLocaleDateString()}<br>` : ''}
                    ${po.issued_date ? `<strong>Issued Date:</strong> ${new Date(po.issued_date).toLocaleDateString()}<br>` : ''}
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            
            <div class="total-section">
                <div class="total-amount">
                    Total Amount: ${po.currency.currency_code} ${po.total_amount.toFixed(2)}
                </div>
            </div>
            
            ${termsHtml}
            
            ${po.remarks ? `
                <div class="terms-section">
                    <h3>Remarks</h3>
                    <p>${po.remarks}</p>
                </div>
            ` : ''}
            
            <div class="footer">
                <p>This is a computer-generated document. No signature is required.</p>
                <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};
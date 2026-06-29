export const InvoiceService = {
  printInvoice(order) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocker prevented printing. Please allow popups for this dashboard.');
      return;
    }

    const itemsRows = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px dashed #dddddd;">
          <strong>${item.name}</strong><br>
          <span style="font-size: 11px; color: #666666;">Variant: ${item.variant || 'Standard'}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px dashed #dddddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px dashed #dddddd; text-align: right;">₹${(item.price / 100).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px dashed #dddddd; text-align: right;">₹${((item.price * item.quantity) / 100).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Invoice #${order.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; font-size: 13px; color: #120404; line-height: 1.5; padding: 20px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #120404; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 22px; font-weight: bold; letter-spacing: 1px; color: #120404; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .meta-table td { padding: 5px 0; vertical-align: top; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th { padding: 10px; background: #fdf5eb; text-align: left; font-weight: bold; border-bottom: 1px solid #120404; }
            .totals { display: flex; flex-direction: column; align-items: flex-end; margin-top: 20px; }
            .totals-row { display: flex; width: 300px; justify-content: space-between; padding: 5px 0; }
            .footer { border-top: 1px solid #dddddd; padding-top: 20px; margin-top: 50px; font-size: 11px; text-align: center; color: #666666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">SPILL THE BEANS</div>
              <div>Premium Specialty Coffee & Roasters</div>
              <div>hello@spillthebeans.com | Bengaluru, India</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #120404;">TAX INVOICE</h2>
              <div>Invoice No: <strong>INV-${order.id.replace('ord-det-', '')}</strong></div>
              <div>Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
              <div>Order ID: #${order.id}</div>
            </div>
          </div>

          <table class="meta-table">
            <tr>
              <td style="width: 50%;">
                <strong style="font-size: 14px;">Billed To:</strong><br>
                ${order.address.name}<br>
                ${order.address.line1}<br>
                ${order.address.line2 ? `${order.address.line2}<br>` : ''}
                ${order.address.city}, ${order.address.state} - ${order.address.pincode}<br>
                Phone: ${order.customerPhone}<br>
                Email: ${order.customerEmail}
              </td>
              <td style="width: 50%; text-align: right;">
                <strong>Payment Details:</strong><br>
                Method: ${order.paymentMethod}<br>
                Status: ${order.paymentStatus}<br>
                Transaction ID: ${order.transactionId || 'N/A'}<br>
                Date Paid: ${order.timeline.confirmed ? new Date(order.timeline.confirmed).toLocaleDateString() : 'N/A'}
              </td>
            </tr>
          </table>

          <table class="items-table">
            <thead>
              <tr>
                <th>Product Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <strong>₹${(order.subtotal / 100).toFixed(2)}</strong>
            </div>
            ${order.discount > 0 ? `
              <div class="totals-row" style="color: green;">
                <span>Discount:</span>
                <strong>-₹${(order.discount / 100).toFixed(2)}</strong>
              </div>
            ` : ''}
            <div class="totals-row">
              <span>Shipping Fee:</span>
              <strong>₹${(order.shippingFee / 100).toFixed(2)}</strong>
            </div>
            <div class="totals-row">
              <span>GST (18%):</span>
              <strong>₹${(order.tax / 100).toFixed(2)}</strong>
            </div>
            <div class="totals-row" style="border-top: 1px solid #120404; padding-top: 8px; font-size: 15px; margin-top: 5px;">
              <span>Grand Total:</span>
              <strong>₹${(order.total / 100).toFixed(2)}</strong>
            </div>
          </div>

          <div class="footer">
            Thank you for shopping at Spill The Beans! Brewing happiness in every cup.<br>
            This is a computer-generated tax invoice and requires no physical signature.
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Allow resource loads then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  },

  async downloadInvoicePDF(order) {
    // Standard simulation of PDF generation download
    this.printInvoice(order);
    return true;
  }
};

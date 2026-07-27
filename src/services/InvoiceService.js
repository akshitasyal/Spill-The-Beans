export const InvoiceService = {
  formatMoney(val) {
    if (val === undefined || val === null) return '0.00';
    const num = Number(val);
    if (isNaN(num)) return '0.00';
    const inRupees = num > 5000 ? num / 100 : num;
    return inRupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  printInvoice(order, isDownload = false) {
    if (!order) {
      console.warn('InvoiceService: No order provided to printInvoice');
      return;
    }

    const orderIdStr = String(order.id || '0000');
    const cleanInvoiceNum = orderIdStr.replace(/^ord-det-|^ord-|^cm/, '').toUpperCase() || orderIdStr;

    // Address rendering
    let addressHtml = 'Standard Delivery Address';
    if (order.address) {
      if (typeof order.address === 'string') {
        addressHtml = order.address.replace(/\n/g, '<br>');
      } else if (typeof order.address === 'object') {
        const parts = [];
        if (order.address.name) parts.push(`<strong>${order.address.name}</strong>`);
        if (order.address.line1) parts.push(order.address.line1);
        if (order.address.line2) parts.push(order.address.line2);
        const cityStateZip = [
          order.address.city,
          order.address.state
        ].filter(Boolean).join(', ') + (order.address.pincode ? ` - ${order.address.pincode}` : '');
        if (cityStateZip) parts.push(cityStateZip);
        addressHtml = parts.length > 0 ? parts.join('<br>') : 'Standard Delivery Address';
      }
    }

    const customerName = order.user?.name || order.customerName || (typeof order.address === 'object' ? order.address?.name : null) || 'Valued Customer';
    const customerPhone = order.user?.phone || order.customerPhone || (typeof order.address === 'object' ? order.address?.phone : null) || 'N/A';
    const customerEmail = order.user?.email || order.customerEmail || 'N/A';

    const orderDateStr = order.createdAt 
      ? new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-IN');

    const datePaidStr = order.timeline?.confirmed
      ? new Date(order.timeline.confirmed).toLocaleDateString('en-IN')
      : (order.paymentStatus === 'PAID' && order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A');

    // Items calculation
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsRows = items.length > 0 ? items.map(item => {
      const price = item.price || 0;
      const qty = item.quantity || 1;
      const total = price * qty;
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px dashed #dddddd;">
            <strong>${item.name || 'Coffee Product'}</strong><br>
            <span style="font-size: 11px; color: #666666;">Variant: ${item.variant || 'Standard'}</span>
          </td>
          <td style="padding: 10px; border-bottom: 1px dashed #dddddd; text-align: center;">${qty}</td>
          <td style="padding: 10px; border-bottom: 1px dashed #dddddd; text-align: right;">₹${this.formatMoney(price)}</td>
          <td style="padding: 10px; border-bottom: 1px dashed #dddddd; text-align: right;">₹${this.formatMoney(total)}</td>
        </tr>
      `;
    }).join('') : `
      <tr>
        <td colspan="4" style="padding: 15px; text-align: center; color: #888888;">No items recorded in this order.</td>
      </tr>
    `;

    // Totals calculation
    const subtotal = order.subtotal !== undefined ? order.subtotal : (order.total || 0);
    const discount = order.discount || 0;
    const shippingFee = order.shippingFee || 0;
    const netBeforeTax = subtotal - discount;
    const tax = order.tax !== undefined ? order.tax : Math.round(netBeforeTax * 0.18 / 1.18);
    const total = order.total !== undefined ? order.total : (subtotal - discount + shippingFee);

    const docTitle = `Invoice-INV-${cleanInvoiceNum}${isDownload ? '.pdf' : ''}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${docTitle}</title>
          <style>
            @media print {
              @page { size: A4; margin: 15mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #120404; line-height: 1.5; padding: 25px; background: #ffffff; margin: 0; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #120404; padding-bottom: 15px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: 800; letter-spacing: 1px; color: #120404; text-transform: uppercase; }
            .sublogo { font-size: 12px; color: #666666; font-weight: 500; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            .meta-table td { padding: 8px 0; vertical-align: top; font-size: 12px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            .items-table th { padding: 10px; background: #fdf5eb; text-align: left; font-weight: 700; border-bottom: 1px solid #120404; font-size: 12px; text-transform: uppercase; color: #443322; }
            .totals { display: flex; flex-direction: column; align-items: flex-end; margin-top: 20px; }
            .totals-row { display: flex; width: 320px; justify-content: space-between; padding: 6px 0; font-size: 13px; }
            .footer { border-top: 1px solid #dddddd; padding-top: 15px; margin-top: 40px; font-size: 11px; text-align: center; color: #777777; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">SPILL THE BEANS</div>
              <div class="sublogo">Premium Specialty Coffee & Roasters</div>
              <div style="font-size: 11px; color: #777777; margin-top: 4px;">hello@spillthebeans.com | Bengaluru, Karnataka, India</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0 0 5px 0; color: #120404; font-size: 18px; letter-spacing: 0.5px;">TAX INVOICE</h2>
              <div>Invoice No: <strong>INV-${cleanInvoiceNum}</strong></div>
              <div>Date: <strong>${orderDateStr}</strong></div>
              <div>Order ID: <strong>#${orderIdStr}</strong></div>
            </div>
          </div>

          <table class="meta-table">
            <tr>
              <td style="width: 50%;">
                <strong style="font-size: 13px; color: #120404;">Billed To:</strong><br>
                <div style="margin-top: 4px; line-height: 1.4;">
                  <strong>${customerName}</strong><br>
                  ${addressHtml}<br>
                  <span style="color: #555555;">Phone: ${customerPhone}</span><br>
                  <span style="color: #555555;">Email: ${customerEmail}</span>
                </div>
              </td>
              <td style="width: 50%; text-align: right;">
                <strong style="font-size: 13px; color: #120404;">Payment Details:</strong><br>
                <div style="margin-top: 4px; line-height: 1.4;">
                  Method: <strong>${order.paymentMethod || 'Online Payment'}</strong><br>
                  Status: <strong>${order.paymentStatus || 'COMPLETED'}</strong><br>
                  Transaction ID: ${order.transactionId || order.payment?.razorpayPaymentId || 'N/A'}<br>
                  Date Paid: ${datePaidStr}
                </div>
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
              <strong>₹${this.formatMoney(subtotal)}</strong>
            </div>
            ${discount > 0 ? `
              <div class="totals-row" style="color: #16a34a;">
                <span>Discount:</span>
                <strong>-₹${this.formatMoney(discount)}</strong>
              </div>
            ` : ''}
            <div class="totals-row">
              <span>Shipping Fee:</span>
              <strong>${shippingFee === 0 ? 'FREE' : `₹${this.formatMoney(shippingFee)}`}</strong>
            </div>
            <div class="totals-row">
              <span>GST (18% included):</span>
              <strong>₹${this.formatMoney(tax)}</strong>
            </div>
            <div class="totals-row" style="border-top: 2px solid #120404; padding-top: 8px; font-size: 16px; margin-top: 6px; color: #120404;">
              <span>Grand Total:</span>
              <strong>₹${this.formatMoney(total)}</strong>
            </div>
          </div>

          <div class="footer">
            Thank you for shopping at Spill The Beans! Brewing happiness in every cup.<br>
            This is an official computer-generated tax invoice and requires no physical signature.
          </div>
        </body>
      </html>
    `;

    // Try hidden iframe approach first (prevents popup blockers)
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);

      const frameDoc = iframe.contentWindow.document;
      frameDoc.open();
      frameDoc.write(htmlContent);
      frameDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (printErr) {
          console.error('Iframe print error fallback:', printErr);
          this.fallbackWindowPrint(htmlContent, docTitle);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 2000);
        }
      }, 400);
    } catch (err) {
      console.error('Iframe creation error, using popup window:', err);
      this.fallbackWindowPrint(htmlContent, docTitle);
    }
  },

  fallbackWindowPrint(htmlContent, docTitle) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Printing error: Popup blocker blocked invoice window. Please allow popups.');
      return;
    }
    printWindow.document.write(htmlContent);
    printWindow.document.title = docTitle;
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  },

  async downloadInvoicePDF(order) {
    this.printInvoice(order, true);
    return true;
  }
};


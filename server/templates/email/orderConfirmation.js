export const orderConfirmationTemplate = (order) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #120404; color: #FDE0C1; padding: 2rem; }
    .container { max-width: 600px; margin: 0 auto; background: #1c0a0a; border: 1px solid #3c1e1e; border-radius: 12px; padding: 2.5rem; }
    .logo { font-size: 24px; text-align: center; margin-bottom: 2rem; color: #C27A0A; font-weight: bold; }
    h1 { font-size: 22px; color: #FDE0C1; text-align: center; }
    p { line-height: 1.6; font-size: 15px; color: #d0c0b0; }
    .details { background: rgba(253,224,193,0.02); border: 1px solid #3c1e1e; border-radius: 8px; padding: 1.25rem; margin: 1.5rem 0; }
    .item-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #3c1e1e; padding: 0.6rem 0; }
    .item-row:last-child { border-bottom: none; }
    .total-row { display: flex; justify-content: space-between; font-weight: bold; padding-top: 0.8rem; font-size: 16px; color: #C27A0A; }
    .footer { text-align: center; margin-top: 3rem; font-size: 12px; color: #7b6e63; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">☕ Spill The Beans</div>
    <h1>Thank You for Your Order!</h1>
    <p>Hi ${order.customerName || 'Coffee Lover'},</p>
    <p>Your order <strong>#${order.id}</strong> has been received and is currently being processed. Here are your order details:</p>
    
    <div class="details">
      <h3>Order #${order.id}</h3>
      ${(order.items || []).map(item => `
        <div class="item-row">
          <span>${item.productName} (x${item.quantity})</span>
          <span>₹${((item.price * item.quantity) / 100).toFixed(2)}</span>
        </div>
      `).join('')}
      <div class="total-row">
        <span>Total Paid</span>
        <span>₹${(order.total / 100).toFixed(2)}</span>
      </div>
    </div>
    
    <p>We'll notify you as soon as your fresh beans are shipped out!</p>
    <p>Stay caffeinated,<br/><strong>The Spill The Beans Team</strong></p>
    <div class="footer">
      &copy; 2026 Spill The Beans. All rights reserved.<br/>
      Koramangala, Bengaluru, India
    </div>
  </div>
</body>
</html>
`;

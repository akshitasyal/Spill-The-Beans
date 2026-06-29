export const shippingUpdateTemplate = (order, trackingNum, courier) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #120404; color: #FDE0C1; padding: 2rem; }
    .container { max-width: 600px; margin: 0 auto; background: #1c0a0a; border: 1px solid #3c1e1e; border-radius: 12px; padding: 2.5rem; }
    .logo { font-size: 24px; text-align: center; margin-bottom: 2rem; color: #C27A0A; font-weight: bold; }
    h1 { font-size: 22px; color: #FDE0C1; text-align: center; }
    p { line-height: 1.6; font-size: 15px; color: #d0c0b0; }
    .details { background: rgba(253,224,193,0.02); border: 1px solid #3c1e1e; border-radius: 8px; padding: 1.25rem; margin: 1.5rem 0; text-align: center; }
    .tracking-code { font-family: monospace; font-size: 18px; color: #C27A0A; font-weight: bold; margin: 0.5rem 0; letter-spacing: 1px; }
    .btn { display: block; width: 200px; margin: 2rem auto; padding: 0.8rem; background: #C27A0A; color: #FFF; text-decoration: none; text-align: center; border-radius: 6px; font-weight: bold; }
    .footer { text-align: center; margin-top: 3rem; font-size: 12px; color: #7b6e63; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">☕ Spill The Beans</div>
    <h1>Your Coffee is on the Way!</h1>
    <p>Hi ${order.customerName || 'Coffee Lover'},</p>
    <p>Great news! Your order <strong>#${order.id}</strong> has been shipped and is heading towards your mug.</p>
    
    <div class="details">
      <div>Courier Partner</div>
      <div style="font-size: 16px; font-weight: bold; color: #FDE0C1; margin-bottom: 0.5rem;">${courier || 'Delhivery'}</div>
      <div>Tracking ID</div>
      <div class="tracking-code">${trackingNum || 'STB123456789'}</div>
    </div>

    <a href="https://spillthebeans.in/orders/track?id=${order.id}" class="btn">Track Order</a>
    
    <p>Stay caffeinated,<br/><strong>The Spill The Beans Team</strong></p>
    <div class="footer">
      &copy; 2026 Spill The Beans. All rights reserved.<br/>
      Koramangala, Bengaluru, India
    </div>
  </div>
</body>
</html>
`;

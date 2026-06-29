export const reviewRequestTemplate = (name, productName, reviewUrl) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #120404; color: #FDE0C1; padding: 2rem; }
    .container { max-width: 600px; margin: 0 auto; background: #1c0a0a; border: 1px solid #3c1e1e; border-radius: 12px; padding: 2.5rem; }
    .logo { font-size: 24px; text-align: center; margin-bottom: 2rem; color: #C27A0A; font-weight: bold; }
    h1 { font-size: 22px; color: #FDE0C1; text-align: center; }
    p { line-height: 1.6; font-size: 15px; color: #d0c0b0; }
    .stars { text-align: center; font-size: 32px; margin: 1.5rem 0; color: #7b6e63; }
    .btn { display: block; width: 220px; margin: 2rem auto; padding: 0.8rem; background: #C27A0A; color: #FFF; text-decoration: none; text-align: center; border-radius: 6px; font-weight: bold; }
    .footer { text-align: center; margin-top: 3rem; font-size: 12px; color: #7b6e63; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">☕ Spill The Beans</div>
    <h1>How was the coffee, ${name}?</h1>
    <p>We hope you are enjoying your recent purchase of <strong>${productName || 'our premium coffee'}</strong>.</p>
    <p>As an independent brand, feedback helps us perfect our roasts and aids other coffee lovers in finding their perfect cup.</p>
    <p>Could you take 60 seconds to tell us about your experience?</p>

    <div class="stars">⭐⭐⭐⭐⭐</div>
    
    <a href="${reviewUrl || '#'}" class="btn">Write a Review</a>
    
    <p>Stay caffeinated,<br/><strong>The Spill The Beans Team</strong></p>
    <div class="footer">
      &copy; 2026 Spill The Beans. All rights reserved.<br/>
      Koramangala, Bengaluru, India
    </div>
  </div>
</body>
</html>
`;

export const welcomeTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #120404; color: #FDE0C1; padding: 2rem; }
    .container { max-width: 600px; margin: 0 auto; background: #1c0a0a; border: 1px solid #3c1e1e; border-radius: 12px; padding: 2.5rem; }
    .logo { font-size: 24px; text-align: center; margin-bottom: 2rem; color: #C27A0A; font-weight: bold; }
    h1 { font-size: 22px; color: #FDE0C1; text-align: center; }
    p { line-height: 1.6; font-size: 15px; color: #d0c0b0; }
    .btn { display: block; width: 200px; margin: 2rem auto; padding: 0.8rem; background: #C27A0A; color: #FFF; text-decoration: none; text-align: center; border-radius: 6px; font-weight: bold; }
    .footer { text-align: center; margin-top: 3rem; font-size: 12px; color: #7b6e63; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">☕ Spill The Beans</div>
    <h1>Welcome to the Club, ${name}!</h1>
    <p>We are absolutely thrilled to have you here. Spill The Beans is crafted for those who demand bold energy and premium quality from their daily cup.</p>
    <p>Get ready to explore India's finest soluble coffees, artisanal blends, and single-origin Arabica beans, sourced directly from the best estates.</p>
    <a href="https://spillthebeans.in/shop" class="btn">Explore the Shop</a>
    <p>Stay caffeinated,<br/><strong>The Spill The Beans Team</strong></p>
    <div class="footer">
      &copy; 2026 Spill The Beans. All rights reserved.<br/>
      Koramangala, Bengaluru, India
    </div>
  </div>
</body>
</html>
`;

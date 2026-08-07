// Spill The Beans — Mega Menu Dynamic Data System
import productVanilla100g from '../assets/product_vanilla_100g.png';
import productEspresso100g from '../assets/product_espresso_100g.png';
import stbAssortedBox from '../assets/stb_assorted_box.png';
import slideSachets from '../assets/slide_sachets.png';
import productGiftBox from '../assets/product_gift_box.png';
import productBundle from '../assets/product_bundle.png';
import stbBestsellersBox from '../assets/stb_bestsellers_box.png';

import icedTeaGuavaChilli from '../assets/iced_tea_guava_chilli.jpg';
import icedTeaStrawberry from '../assets/iced_tea_strawberry.jpg';
import icedTeaAssorted from '../assets/iced_tea_assorted.jpg';
import slideIcedTea from '../assets/slide_iced_tea.png';

import accessoryMilkFrother from '../assets/accessory_milk_frother.png';
import accessoryTumbler from '../assets/accessory_tumbler.png';
import slideFrother from '../assets/slide_frother.png';

export const DEFAULT_FEATURED = {
  title: 'Crafted Coffee Collection',
  highlights: '100% Premium Arabica • Instant & Beans',
  rating: 4.9,
  price: 'Starting at ₹510',
  cta: 'Explore All Coffees →',
  to: '/shop?category=coffee',
  image: productVanilla100g,
};

export const MEGA_MENU_DATA = [
  {
    id: 'coffee',
    title: 'COFFEE',
    viewAllLink: '/shop?category=coffee',
    defaultFeatured: DEFAULT_FEATURED,
    items: [
      {
        id: 'instant-coffee',
        label: 'Instant Coffee',
        to: '/shop?category=coffee',
        featured: {
          title: 'Premium Instant Coffee',
          highlights: '10 Gourmet Flavours • No Added Sugar',
          rating: 4.9,
          price: 'Starting at ₹534',
          cta: 'Shop Collection →',
          to: '/shop?category=coffee',
          image: productVanilla100g,
        },
      },
      {
        id: 'premium-coffee',
        label: 'Premium Coffee',
        to: '/product/raat-ki-rani-espresso-100g',
        featured: {
          title: 'Raat Ki Rani Dark Espresso',
          highlights: 'Monsooned Coorg Beans • High Caffeine',
          rating: 4.9,
          price: 'Starting at ₹586',
          cta: 'Discover Brew →',
          to: '/product/raat-ki-rani-espresso-100g',
          image: productEspresso100g,
        },
      },
      {
        id: 'assorted-box',
        label: 'Assorted Coffee Box',
        to: '/product/assorted-30-pack',
        featured: {
          title: 'Assorted 30-Sachet Explorer Box',
          highlights: '6 Iconic Flavours • Perfect Gift',
          rating: 4.8,
          price: '₹899',
          cta: 'Shop Box →',
          to: '/product/assorted-30-pack',
          image: stbAssortedBox,
        },
      },
      {
        id: 'coffee-sachets',
        label: 'Coffee Sachets',
        to: '/product/bestsellers-10-pack',
        featured: {
          title: 'On-The-Go Coffee Sachets',
          highlights: 'Single Serve Pockets • Dissolves Hot or Cold',
          rating: 4.9,
          price: 'Starting at ₹199',
          cta: 'Shop Sachets →',
          to: '/product/bestsellers-10-pack',
          image: slideSachets,
        },
      },
      {
        id: 'best-sellers',
        label: 'Best Sellers',
        to: '/shop?filter=bestseller',
        featured: {
          title: 'Fan Favourite Bestsellers',
          highlights: 'Over 50,000 Jars Shipped Across India',
          rating: 4.9,
          price: 'Starting at ₹510',
          cta: 'Shop Bestsellers →',
          to: '/shop?filter=bestseller',
          image: stbBestsellersBox,
        },
      },
    ],
  },

  {
    id: 'tea',
    title: 'TEA',
    viewAllLink: '/shop?category=iced-tea',
    defaultFeatured: {
      title: 'Guilt Free Iced Tea',
      highlights: 'Zero Calories • Real Fruit Extracts • Cold Refreshment',
      rating: 4.8,
      price: 'Starting at ₹399',
      cta: 'Explore Iced Teas →',
      to: '/shop?category=iced-tea',
      image: slideIcedTea,
    },
    items: [
      {
        id: 'guilt-free-iced-tea',
        label: 'Guilt Free Iced Tea',
        to: '/shop?category=iced-tea',
        featured: {
          title: 'Guilt Free Iced Tea Trio',
          highlights: 'Zero Sugar • High Antioxidants • Pure Fruit Energy',
          rating: 4.8,
          price: '₹699',
          cta: 'Shop Trio →',
          to: '/product/iced-tea-assorted-5-flavours',
          image: icedTeaAssorted,
        },
      },
      {
        id: 'lemon-tea',
        label: 'Lemon Tea',
        to: '/product/iced-tea-assorted-5-flavours',
        featured: {
          title: 'Zesty Himalayan Lemon Tea',
          highlights: 'Tangy Sunshine Citrus • Refreshing Hot or Cold',
          rating: 4.7,
          price: '₹349',
          cta: 'Shop Lemon Tea →',
          to: '/product/iced-tea-assorted-5-flavours',
          image: slideIcedTea,
        },
      },
      {
        id: 'strawberry-tea',
        label: 'Strawberry Tea',
        to: '/product/iced-tea-strawberry',
        featured: {
          title: 'Mahabaleshwar Strawberry Tea',
          highlights: 'Real Berry Infusion • Sweet & Aromatic',
          rating: 4.9,
          price: '₹399',
          cta: 'Shop Strawberry Tea →',
          to: '/product/iced-tea-strawberry',
          image: icedTeaStrawberry,
        },
      },
      {
        id: 'pineapple-tea',
        label: 'Pineapple Tea',
        to: '/product/pal-pal-pineapple-50g',
        featured: {
          title: 'Tropical Pineapple Punch Tea',
          highlights: 'Sweet Tangy Burst • Exotic Summer Brew',
          rating: 4.8,
          price: '₹399',
          cta: 'Shop Pineapple Tea →',
          to: '/product/pal-pal-pineapple-50g',
          image: slideIcedTea,
        },
      },
      {
        id: 'guava-tea',
        label: 'Guava Tea',
        to: '/product/iced-tea-guava-chilli',
        featured: {
          title: 'Spiced Guava Chilli Tea',
          highlights: 'Pink Guava Punch with a Touch of Salt & Chilli',
          rating: 4.9,
          price: '₹399',
          cta: 'Shop Guava Tea →',
          to: '/product/iced-tea-guava-chilli',
          image: icedTeaGuavaChilli,
        },
      },
    ],
  },

  {
    id: 'accessories',
    title: 'ACCESSORIES',
    viewAllLink: '/shop?category=accessories',
    defaultFeatured: {
      title: 'Barista Accessories',
      highlights: 'Make Café Quality Foam & Serve In Style',
      rating: 4.9,
      price: 'Starting at ₹299',
      cta: 'Shop Accessories →',
      to: '/shop?category=accessories',
      image: slideFrother,
    },
    items: [
      {
        id: 'milk-frother',
        label: 'Milk Frother',
        to: '/product/milk-frother',
        featured: {
          title: 'Barista Milk Frother',
          highlights: 'Make Café-Style Coffee • Perfect Milk Foam in 15s',
          rating: 4.9,
          price: '₹1,299',
          cta: 'Shop Now →',
          to: '/product/milk-frother',
          image: accessoryMilkFrother,
        },
      },
      {
        id: 'coffee-mug',
        label: 'Coffee Mug',
        to: '/product/stb-branded-tumbler',
        featured: {
          title: 'Double-Wall Thermal Tumbler (700ml)',
          highlights: 'Keeps Hot for 6 Hours • Cold for 12 Hours',
          rating: 4.9,
          price: '₹899',
          cta: 'Shop Tumbler →',
          to: '/product/stb-branded-tumbler',
          image: accessoryTumbler,
        },
      },
    ],
  },
];

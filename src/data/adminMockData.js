// ============================================================
//  SPILL THE BEANS — Programmatic Administrative Mock Seeding
//  Generates exactly 50 Customers & 150 Orders
// ============================================================

const NAMES = [
  'Arjun Mehta', 'Priya Sharma', 'Rahul Nair', 'Aishwarya Sen', 'Vikram Patel',
  'Sneha Iyer', 'Amit Gupta', 'Deepika Roy', 'Rohan Verma', 'Kavita Rao',
  'Devendra Sharma', 'Asha Patel', 'Rohan Mehra', 'Kritika Roy', 'Kabir Das',
  'Ananya Goel', 'Siddharth Sen', 'Priya Nair', 'Manish Pandey', 'Neha Dixit',
  'Rajesh Kumar', 'Simran Kaur', 'Karan Johar', 'Tanvi Shah', 'Aditya Birla',
  'Rani Mukherjee', 'Hrithik Roshan', 'Kareena Kapoor', 'Ranbir Kapoor', 'Alia Bhatt',
  'Varun Dhawan', 'Shraddha Kapoor', 'Sidharth Malhotra', 'Kiara Advani', 'Vicky Kaushal',
  'Katrina Kaif', 'Ranveer Singh', 'Deepika Padukone', 'Anushka Sharma', 'Virat Kohli',
  'Rohit Sharma', 'Hardik Pandya', 'Jasprit Bumrah', 'KL Rahul', 'Rishabh Pant',
  'Shreyas Iyer', 'Yuzvendra Chahal', 'Ravindra Jadeja', 'Shikhar Dhawan', 'MS Dhoni'
];

const CITIES = [
  { city: 'Bengaluru', state: 'Karnataka', pinPrefix: '560' },
  { city: 'Mumbai', state: 'Maharashtra', pinPrefix: '400' },
  { city: 'New Delhi', state: 'Delhi', pinPrefix: '110' },
  { city: 'Kolkata', state: 'West Bengal', pinPrefix: '700' },
  { city: 'Chennai', state: 'Tamil Nadu', pinPrefix: '600' },
  { city: 'Hyderabad', state: 'Telangana', pinPrefix: '500' },
  { city: 'Jaipur', state: 'Rajasthan', pinPrefix: '302' },
  { city: 'Pune', state: 'Maharashtra', pinPrefix: '411' },
  { city: 'Ahmedabad', state: 'Gujarat', pinPrefix: '380' },
  { city: 'Kochi', state: 'Kerala', pinPrefix: '682' }
];

const PRODUCTS_POOL = [
  { name: 'Vanilla Dream Soluble', price: 34900, variant: '100g', image: '/assets/product_vanilla_100g.png' },
  { name: 'Hazelnut Bliss Instant', price: 34900, variant: '100g', image: '/assets/product_hazelnut_100g.png' },
  { name: 'Caramel Surge Coffee', price: 34900, variant: '50g', image: '/assets/product_caramel_50g.png' },
  { name: 'Raat Ki Rani Espresso', price: 44900, variant: '250g', image: '/assets/product_espresso_50g.png' },
  { name: 'Araku Valley Single Origin', price: 59900, variant: '250g', image: '/assets/product_espresso_100g.png' },
  { name: 'Milk Frother Pro', price: 99900, variant: 'Steel Gray', image: '/assets/accessory_milk_frother.png' },
  { name: 'Assorted Gourmet Gift Box', price: 149900, variant: 'Gift Pack', image: '/assets/stb_assorted_box.png' },
  { name: 'Hustle Mode Bundle', price: 189900, variant: 'Trio Pack', image: '/assets/combo_hustle_mode_frother_bestsellers.jpg' }
];

const COURIERS = ['Delhivery', 'BlueDart', 'XpressBees', 'DTDC', 'FedEx India'];
const NOTES_POOL = [
  'Frequent buyer',
  'VIP Customer - handle packaging with care.',
  'Customer requested zero plastic packaging.',
  'Requested call before delivery.',
  'Priority express delivery requested.',
  'Likes light roasts. Keep updated with new origin drops.',
  'Has reported damaged jar previously. Wrap thoroughly.'
];

const ORDER_NOTES = [
  'Customer requested gift wrapping with custom tag: "Happy Birthday!".',
  'Delayed by 1 day due to local heavy rainfall.',
  'Leave package near the shoe rack if no response.',
  'Priority customer. Dispatched via express air corridor.',
  'Address verified by phone call.'
];

export function initializeMockData() {
  const localCust = localStorage.getItem('stb_admin_detailed_customers');
  const localOrd = localStorage.getItem('stb_admin_detailed_orders');

  if (localCust && localOrd) {
    return {
      customers: JSON.parse(localCust),
      orders: JSON.parse(localOrd)
    };
  }

  // 1. Generate 50 Customers
  const generatedCustomers = [];
  for (let i = 0; i < 50; i++) {
    const name = NAMES[i];
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    const phone = `+91 ${Math.floor(Math.random() * 90000 + 10000)} ${Math.floor(Math.random() * 90000 + 10000)}`;
    const joinedDaysAgo = Math.floor(Math.random() * 300) + 15;
    const joinedDate = new Date(Date.now() - joinedDaysAgo * 24 * 3600000).toISOString();
    
    // City selection
    const cityObj = CITIES[i % CITIES.length];
    const pincode = `${cityObj.pinPrefix}${Math.floor(Math.random() * 900 + 100)}`;
    
    const addresses = [
      {
        id: `addr-1-${i}`,
        name,
        phone,
        line1: `Flat ${Math.floor(Math.random() * 800) + 100}, Block ${String.fromCharCode(65 + (i % 6))}, Skyview Towers`,
        line2: 'Near Central Park',
        city: cityObj.city,
        state: cityObj.state,
        pincode,
        isDefault: true
      }
    ];

    // Add optional second address
    if (i % 3 === 0) {
      addresses.push({
        id: `addr-2-${i}`,
        name,
        phone,
        line1: `Plot No ${Math.floor(Math.random() * 150) + 1}, Sector 4`,
        line2: 'Industrial Area Phase 2',
        city: cityObj.city,
        state: cityObj.state,
        pincode,
        isDefault: false
      });
    }

    generatedCustomers.push({
      id: `usr-det-${100 + i}`,
      name,
      email,
      phone,
      joinedDate,
      role: 'CUSTOMER',
      accountStatus: i % 12 === 0 ? 'SUSPENDED' : 'ACTIVE',
      addresses,
      notes: i % 7 === 0 ? NOTES_POOL[i % NOTES_POOL.length] : '',
      wishlist: PRODUCTS_POOL.slice(0, (i % 3) + 1).map(p => p.name),
      reviews: i % 5 === 0 ? [
        {
          productName: PRODUCTS_POOL[i % PRODUCTS_POOL.length].name,
          rating: 4 + (i % 2),
          title: 'Satisfied with the brew',
          body: 'Great rich taste, goes perfectly as a morning espresso latte.',
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 3600000).toISOString()
        }
      ] : [],
      activity: [
        { type: 'SIGNUP', label: 'Signed up on platform', timestamp: joinedDate }
      ]
    });
  }

  // 2. Generate 150 Orders
  const generatedOrders = [];
  const statusCycle = ['PENDING', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
  const methodCycle = ['RAZORPAY', 'STRIPE', 'COD'];

  for (let i = 0; i < 150; i++) {
    // Select customer
    const customer = generatedCustomers[i % 50];
    
    // Pick products
    const itemQty = (i % 3) + 1;
    const items = [];
    let subtotal = 0;
    for (let k = 0; k < itemQty; k++) {
      const p = PRODUCTS_POOL[(i + k) % PRODUCTS_POOL.length];
      const quantity = (k % 2) + 1;
      const price = p.price;
      subtotal += price * quantity;
      items.push({
        id: `ord-item-${i}-${k}`,
        productId: `p-${(i + k) % PRODUCTS_POOL.length}`,
        name: p.name,
        variant: p.variant,
        image: p.image,
        price,
        quantity
      });
    }

    // Money Calculations
    const discount = i % 5 === 0 ? 5000 : 0; // 50 Rupees discount on every 5th order
    const shippingFee = subtotal > 49900 ? 0 : 6000; // Free shipping above Rs 499
    const tax = Math.round((subtotal - discount) * 0.18); // 18% GST
    const total = subtotal - discount + shippingFee + tax;

    // Status Assignment
    let status = statusCycle[i % statusCycle.length];
    
    // Adjust status to make DELIVERED the most common (makes statistics realistic)
    if (i < 90) {
      status = 'DELIVERED';
    }

    let paymentMethod = methodCycle[i % methodCycle.length];
    let paymentStatus = 'PENDING';
    if (status === 'DELIVERED' || status === 'SHIPPED' || status === 'OUT_FOR_DELIVERY' || status === 'PACKED' || status === 'PROCESSING') {
      paymentStatus = paymentMethod === 'COD' ? 'PENDING' : 'PAID';
    } else if (status === 'REFUNDED') {
      paymentStatus = 'REFUNDED';
    } else if (status === 'CANCELLED') {
      paymentStatus = i % 4 === 0 ? 'FAILED' : 'PENDING';
    }

    // Dates
    const orderDaysAgo = Math.floor(Math.random() * 60) + 1; // within last 60 days
    const createdTime = new Date(Date.now() - orderDaysAgo * 24 * 3600000 - (i % 20) * 3600000).getTime();
    const createdAt = new Date(createdTime).toISOString();

    // Timeline Timestamps
    const timeline = {
      placed: createdAt,
      confirmed: paymentStatus === 'PAID' ? new Date(createdTime + 1800000).toISOString() : null,
      processing: status !== 'PENDING' ? new Date(createdTime + 3600000).toISOString() : null,
      packed: ['PACKED', 'SHIPPED', 'DELIVERED'].includes(status) ? new Date(createdTime + 7200000).toISOString() : null,
      shipped: ['SHIPPED', 'DELIVERED'].includes(status) ? new Date(createdTime + 18000000).toISOString() : null,
      delivered: status === 'DELIVERED' ? new Date(createdTime + 86400000).toISOString() : null
    };

    // Shipping info
    const courier = COURIERS[i % COURIERS.length];
    const trackingNo = ['SHIPPED', 'DELIVERED'].includes(status) ? `TRK-${Math.floor(Math.random() * 90000000 + 10000000)}` : null;

    // Build Order Card Object
    const order = {
      id: `ord-det-${1000 + i}`,
      userId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      address: customer.addresses[0],
      status,
      paymentMethod,
      paymentStatus,
      subtotal,
      discount,
      shippingFee,
      tax,
      total,
      trackingId: trackingNo,
      courierPartner: trackingNo ? courier : null,
      shippingDate: trackingNo ? timeline.shipped : null,
      estimatedDelivery: trackingNo ? new Date(new Date(timeline.shipped).getTime() + 86400000 * 2).toISOString() : null,
      deliveryDate: status === 'DELIVERED' ? timeline.delivered : null,
      transactionId: paymentStatus === 'PAID' ? `TXN-${Math.floor(Math.random() * 900000000 + 100000000)}` : null,
      notes: i % 8 === 0 ? ORDER_NOTES[i % ORDER_NOTES.length] : '',
      items,
      timeline,
      createdAt,
      updatedAt: createdAt
    };

    generatedOrders.push(order);

    // Update customer stats
    customer.orderCount = (customer.orderCount || 0) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + total;
    customer.lastOrderDate = createdAt;
    
    // Add activity log
    customer.activity.push({
      type: 'ORDER',
      label: `Placed Order #${order.id}`,
      timestamp: createdAt
    });

    if (status === 'CANCELLED') {
      customer.activity.push({
        type: 'CANCEL',
        label: `Cancelled Order #${order.id}`,
        timestamp: new Date(createdTime + 7200000).toISOString()
      });
    }
  }

  // Save to LocalStorage
  localStorage.setItem('stb_admin_detailed_customers', JSON.stringify(generatedCustomers));
  localStorage.setItem('stb_admin_detailed_orders', JSON.stringify(generatedOrders));

  return {
    customers: generatedCustomers,
    orders: generatedOrders
  };
}

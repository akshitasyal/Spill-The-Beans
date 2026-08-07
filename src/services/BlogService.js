const MOCK_BLOGS = [
  {
    id: 'blog-001',
    title: 'Protein Coffee (Proffee): Energy & Nutrition',
    slug: 'protein-coffee-recipe',
    excerpt: 'A creamy, protein-packed coffee recipe that is perfect for busy mornings, workouts, or afternoon energy.',
    content: 'Learn how to combine Spill The Beans premium soluble blends with clean whey isolate for the ultimate gym fuel drink...',
    image: '/assets/proffee_hero_new.png',
    category: 'Recipes',
    tags: ['Fitness', 'Protein', 'Quick Recipes'],
    readTime: '3 min',
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: 'blog-002',
    title: 'What Is Specialty Coffee — Cupping Scales Explained',
    slug: 'what-is-specialty-coffee',
    excerpt: 'Not all coffee is created equal. We break down the SCA cupping scale and why it matters.',
    content: 'Specialty coffee must score above 80 points on the SCA cupping scale. Learn about estates, roast consistency, and flavor profiling...',
    image: '/assets/specialty_coffee_hero.png',
    category: 'Guides',
    tags: ['SCA', 'Specialty Grade', 'Espresso'],
    readTime: '5 min',
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString()
  },
  {
    id: 'blog-003',
    title: 'How to Store Coffee Beans Right',
    slug: 'store-coffee-beans-right',
    excerpt: 'Oxidation is the enemy. Discover the best practices to keep your beans fresh and highly aromatic.',
    content: 'Never store your coffee beans in the freezer. Moisture builds up and destroys essential oils. Instead, use an airtight vacuum canister...',
    image: '/assets/store_beans_hero.png',
    category: 'Tips',
    tags: ['Storage', 'Freshness', 'Espresso Beans'],
    readTime: '4 min',
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString()
  },
  {
    id: 'blog-004',
    title: 'Coffee and Productivity — The Science of Focus',
    slug: 'coffee-and-productivity',
    excerpt: 'How caffeine binds to adenosine receptors and how to stack your coffee window for peak focus.',
    content: 'Delay your first cup of coffee by 90 minutes after waking up to avoid the afternoon crash. This allows cortisol levels to balance...',
    image: '/assets/coffee_productivity_hero.png',
    category: 'Science',
    tags: ['Caffeine', 'Focus', 'Productivity'],
    readTime: '6 min',
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 22).toISOString()
  },
  {
    id: 'blog-005',
    title: 'The Terroir of Araku Valley Shade Grown Coffee',
    slug: 'araku-valley-origin',
    excerpt: 'Discover the biodynamic practices and micro-climate giving Araku beans their signature sweet citrus notes.',
    content: 'Nestled in the Eastern Ghats, Araku Valley shade-grown coffee is nurtured by tribal growers. The iron-rich soils yield sweet spicy notes...',
    image: '/assets/product_araku.png',
    category: 'Origins',
    tags: ['Araku Valley', 'Organic', 'Single Origin'],
    readTime: '7 min',
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString()
  }
];

function getLocalBlogs() {
  const local = localStorage.getItem('stb_admin_blogs');
  if (!local) {
    localStorage.setItem('stb_admin_blogs', JSON.stringify(MOCK_BLOGS));
    return MOCK_BLOGS;
  }
  return JSON.parse(local);
}

function saveLocalBlogs(blogs) {
  localStorage.setItem('stb_admin_blogs', JSON.stringify(blogs));
}

export const BlogService = {
  async getBlogs() {
    // Pure localStorage client model for convenience, matching the fact that the frontend blogs page reads statically
    const blogs = getLocalBlogs();
    return { success: true, data: blogs };
  },

  async getBlog(id) {
    const blogs = getLocalBlogs();
    const blog = blogs.find(b => b.id === id);
    if (!blog) throw new Error('Blog post not found');
    return { success: true, data: blog };
  },

  async createBlog(blogData) {
    const blogs = getLocalBlogs();
    const newBlog = {
      ...blogData,
      id: `blog-${Date.now()}`,
      isActive: blogData.isActive !== undefined ? blogData.isActive : true,
      readTime: blogData.readTime || '4 min',
      createdAt: new Date().toISOString()
    };

    const exists = blogs.some(b => b.slug.toLowerCase() === newBlog.slug.toLowerCase());
    if (exists) throw new Error('Blog slug already exists');

    blogs.unshift(newBlog);
    saveLocalBlogs(blogs);
    return { success: true, data: newBlog };
  },

  async updateBlog(id, blogData) {
    const blogs = getLocalBlogs();
    const idx = blogs.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Blog post not found');

    if (blogData.slug && blogData.slug.toLowerCase() !== blogs[idx].slug) {
      const exists = blogs.some(b => b.slug.toLowerCase() === blogData.slug.toLowerCase());
      if (exists) throw new Error('Blog slug already exists');
    }

    blogs[idx] = {
      ...blogs[idx],
      ...blogData,
      updatedAt: new Date().toISOString()
    };

    saveLocalBlogs(blogs);
    return { success: true, data: blogs[idx] };
  },

  async deleteBlog(id) {
    let blogs = getLocalBlogs();
    blogs = blogs.filter(b => b.id !== id);
    saveLocalBlogs(blogs);
    return { success: true };
  }
};

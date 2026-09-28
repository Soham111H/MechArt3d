const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Create Users (Super Admin, Staff, Customer)
  console.log('👤 Creating Users...');
  const passwordHash = await bcrypt.hash('Admin@1234', 12);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@mechart3d.com' },
    update: {},
    create: {
      name: 'MechArt Admin',
      email: 'admin@mechart3d.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
    },
  });

  const staff1 = await prisma.user.upsert({
    where: { email: 'staff1@mechart3d.com' },
    update: {},
    create: {
      name: 'John Staff',
      email: 'staff1@mechart3d.com',
      passwordHash,
      role: 'STAFF',
      emailVerified: new Date(),
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: 'staff2@mechart3d.com' },
    update: {},
    create: {
      name: 'Jane Staff',
      email: 'staff2@mechart3d.com',
      passwordHash,
      role: 'STAFF',
      emailVerified: new Date(),
    },
  });

  // 2. Create Categories
  console.log('📁 Creating Categories...');
  const catPLA = await prisma.category.upsert({
    where: { slug: 'pla-models' },
    update: {},
    create: {
      name: 'PLA 3D Models',
      slug: 'pla-models',
      description: 'High-quality PLA printed models for everyday use.',
      imageUrl: 'https://images.unsplash.com/photo-1615715873917-8e6dcb5e2fce?w=500&q=80',
    },
  });

  const catResin = await prisma.category.upsert({
    where: { slug: 'resin-miniatures' },
    update: {},
    create: {
      name: 'Resin Miniatures',
      slug: 'resin-miniatures',
      description: 'Ultra-high detail resin prints for collectors.',
      imageUrl: 'https://images.unsplash.com/photo-1596489370601-389f4175de5c?w=500&q=80',
    },
  });

  const catEngineering = await prisma.category.upsert({
    where: { slug: 'engineering-parts' },
    update: {},
    create: {
      name: 'Engineering Parts',
      slug: 'engineering-parts',
      description: 'Durable PETG and ABS parts for functional use.',
      imageUrl: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=500&q=80',
    },
  });

  // 3. Create Products (12 Sample Products)
  console.log('📦 Creating Products & Variants...');
  
  const productsToCreate = [
    {
      name: 'Articulated Dragon',
      slug: 'articulated-dragon',
      categoryId: catPLA.id,
      basePrice: 1499.00,
      material: 'PLA',
      desc: 'Fully articulated 3D printed dragon. Moves beautifully and makes a great desk toy.',
    },
    {
      name: 'Low Poly Planter',
      slug: 'low-poly-planter',
      categoryId: catPLA.id,
      basePrice: 599.00,
      material: 'PLA',
      desc: 'Modern geometric planter perfect for succulents.',
    },
    {
      name: 'Headphone Stand',
      slug: 'headphone-stand',
      categoryId: catPLA.id,
      basePrice: 899.00,
      material: 'PLA',
      desc: 'Minimalist desktop headphone stand.',
    },
    {
      name: 'Cable Organizer Box',
      slug: 'cable-organizer',
      categoryId: catPLA.id,
      basePrice: 450.00,
      material: 'PLA',
      desc: 'Keep your desk clean with this sleek cable management box.',
    },
    // Resin
    {
      name: 'Fantasy Warrior Miniature',
      slug: 'fantasy-warrior-min',
      categoryId: catResin.id,
      basePrice: 1200.00,
      material: 'Resin',
      desc: 'Highly detailed 32mm scale fantasy warrior miniature for tabletop RPGs.',
    },
    {
      name: 'Sci-Fi Space Marine',
      slug: 'space-marine-min',
      categoryId: catResin.id,
      basePrice: 1400.00,
      material: 'Resin',
      desc: 'Intricate sci-fi soldier miniature, ready to paint.',
    },
    {
      name: 'D&D Dice Tower',
      slug: 'dnd-dice-tower',
      categoryId: catResin.id,
      basePrice: 2500.00,
      material: 'Resin',
      desc: 'Gothic castle themed dice tower for fair rolls.',
    },
    {
      name: 'Custom Portrait Bust',
      slug: 'custom-bust',
      categoryId: catResin.id,
      basePrice: 4000.00,
      material: 'Resin',
      isCustom: true,
      desc: 'Send us a photo and we will print a highly detailed resin bust.',
    },
    // Engineering
    {
      name: 'Raspberry Pi 4 Case',
      slug: 'rpi4-case',
      categoryId: catEngineering.id,
      basePrice: 350.00,
      material: 'PETG',
      desc: 'Durable, heat-resistant case for Raspberry Pi 4.',
    },
    {
      name: 'Custom Drone Frame Mount',
      slug: 'drone-mount',
      categoryId: catEngineering.id,
      basePrice: 600.00,
      material: 'Carbon Fiber PLA',
      desc: 'Ultra-lightweight and strong mount for FPV drones.',
    },
    {
      name: 'Vesa Monitor Adapter',
      slug: 'vesa-adapter',
      categoryId: catEngineering.id,
      basePrice: 450.00,
      material: 'PETG',
      desc: 'Strong 100x100 to 75x75 VESA mount adapter.',
    },
    {
      name: 'Mechanical Keyboard Switch Tester',
      slug: 'switch-tester',
      categoryId: catEngineering.id,
      basePrice: 299.00,
      material: 'PLA',
      desc: '9-slot switch tester block for mechanical keyboard enthusiasts.',
    }
  ];

  for (const p of productsToCreate) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.desc,
        categoryId: p.categoryId,
        basePrice: p.basePrice,
        stock: 50,
        material: p.material,
        isCustom: p.isCustom || false,
        isActive: true,
        status: 'PUBLISHED',
      },
    });

    // Create some default variants for each product
    await prisma.variant.create({
      data: {
        productId: product.id,
        color: 'Black',
        stock: 20,
        priceModifier: 0,
      }
    });

    await prisma.variant.create({
      data: {
        productId: product.id,
        color: 'White',
        stock: 15,
        priceModifier: 0,
      }
    });
  }

  // 4. Create Coupons
  console.log('🎟️ Creating Coupons...');
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'FLAT500' },
    update: {},
    create: {
      code: 'FLAT500',
      type: 'FIXED',
      value: 500,
      minOrder: 2000,
      isActive: true,
    },
  });

  // 5. Create Blog Posts
  console.log('📝 Creating Blog Posts...');
  await prisma.blogPost.upsert({
    where: { slug: 'guide-to-pla-vs-resin' },
    update: {},
    create: {
      title: 'The Ultimate Guide: PLA vs Resin 3D Printing',
      slug: 'guide-to-pla-vs-resin',
      content: '<p>When starting with 3D printing, the biggest question is choosing between FDM (PLA) and SLA (Resin). PLA is great for functional parts, while Resin provides unmatched detail...</p>',
      authorId: superAdmin.id,
      category: 'Education',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: 'top-5-3d-printed-gifts' },
    update: {},
    create: {
      title: 'Top 5 3D Printed Gifts for Engineers',
      slug: 'top-5-3d-printed-gifts',
      content: '<p>Looking for the perfect gift? Here are 5 functional and aesthetic 3D prints every engineer will love...</p>',
      authorId: superAdmin.id,
      category: 'Guides',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  console.log('✅ Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting cleanup of fake database details...');

  // 1. Delete all dummy orders and cart items (prevents foreign key errors)
  console.log('🗑️ Deleting Orders...');
  await prisma.orderItem.deleteMany({});
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.order.deleteMany({});
  
  console.log('🗑️ Deleting Cart Items...');
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});

  // 2. Delete all dummy products and variants
  console.log('🗑️ Deleting Products & Variants...');
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.product.deleteMany({});

  // 3. Delete categories and materials
  console.log('🗑️ Deleting Categories & Materials...');
  await prisma.category.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.color.deleteMany({});
  await prisma.applicationCategory.deleteMany({});

  // 4. (Optional) Delete non-admin users
  console.log('🗑️ Deleting dummy customers and staff...');
  await prisma.user.deleteMany({
    where: {
      role: {
        not: 'SUPER_ADMIN'
      }
    }
  });

  console.log('✅ Cleanup complete! Your database is now fresh and ready for real data.');
  console.log('👉 Note: Your Admin account and Store Settings were kept safe!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

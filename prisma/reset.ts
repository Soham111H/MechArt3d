const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting database cleanup (removing dummy data)...');

  // Clean Orders and related
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  console.log('✅ Deleted all Orders and Addresses');

  // Clean Products and related
  await prisma.variant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product3DModel.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  console.log('✅ Deleted all Products and Variants');

  // Clean Categories
  await prisma.category.deleteMany();
  console.log('✅ Deleted all Categories');

  // Clean other content
  await prisma.blogPost.deleteMany();
  await prisma.coupon.deleteMany();
  console.log('✅ Deleted all Blog Posts and Coupons');

  // Clean activity logs
  await prisma.activityLog.deleteMany();
  console.log('✅ Deleted all Activity Logs');

  console.log('🎉 Cleanup complete! The database is now empty (except for your Admin and Staff users).');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export {};

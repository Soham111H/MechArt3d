import { PrismaClient } from '@prisma/client';
import { encryptField } from '../src/lib/security/encryption';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data encryption migration...');

  // 1. Encrypt Users (phone)
  const users = await prisma.user.findMany({
    where: { phone: { not: null } },
  });

  let userCount = 0;
  for (const user of users) {
    if (user.phone && !user.phone.match(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone: encryptField(user.phone) },
      });
      userCount++;
    }
  }
  console.log(`Encrypted ${userCount} user phone numbers.`);

  // 2. Encrypt Addresses (line1, line2, city, pincode)
  const addresses = await prisma.address.findMany();
  let addressCount = 0;
  for (const address of addresses) {
    let updated = false;
    const data: any = {};

    if (address.line1 && !address.line1.match(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/)) {
      data.line1 = encryptField(address.line1);
      updated = true;
    }
    if (address.line2 && !address.line2.match(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/)) {
      data.line2 = encryptField(address.line2);
      updated = true;
    }
    if (address.city && !address.city.match(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/)) {
      data.city = encryptField(address.city);
      updated = true;
    }
    if (address.pincode && !address.pincode.match(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/)) {
      data.pincode = encryptField(address.pincode);
      updated = true;
    }

    if (updated) {
      await prisma.address.update({
        where: { id: address.id },
        data,
      });
      addressCount++;
    }
  }
  console.log(`Encrypted fields for ${addressCount} addresses.`);
  
  console.log('Migration complete.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

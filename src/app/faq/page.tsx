import { prisma } from '@/lib/prisma';
import FaqClient from './FaqClient';

export const metadata = {
  title: 'FAQ — MechArt 3D',
  description: 'Frequently asked questions about MechArt 3D products, shipping, and services.',
};

export default async function FaqPage() {
  const categories = await prisma.faqCategory.findMany({
    include: { items: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  }).catch(() => []);

  return <FaqClient categories={categories} />;
}

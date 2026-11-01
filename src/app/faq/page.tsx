import { prisma } from '@/lib/prisma';
import FaqClient from './FaqClient';

export const metadata = {
  title: 'FAQ — MechArt 3D | 3D Printing & Design Questions Answered',
  description: 'Frequently asked questions about MechArt 3D custom printing, materials, turnaround, shipping, and quotes.',
};

const defaultFaqCategories = [
  {
    id: 'ordering-pricing',
    name: 'Ordering & Instant Quotes',
    items: [
      {
        id: 'faq-1',
        question: 'How do I place an order or get an instant quote?',
        answer: 'You can either shop ready-made designs directly from our Products catalog, submit a custom brief via the "Custom Design" page, or upload your STL/OBJ file to our "Instant Quote" tool for automated volume, weight, and price estimates in seconds.',
      },
      {
        id: 'faq-2',
        question: 'What file formats are supported for 3D printing?',
        answer: 'We support .STL, .OBJ, .STEP, .STP, and .3MF files. If you only have sketches, technical 2D drawings, or concept images, our design team can convert them into print-ready parametric CAD models for you.',
      },
      {
        id: 'faq-3',
        question: 'Is there a minimum order quantity (MOQ)?',
        answer: 'No! There is no minimum order quantity. We cater to single prototypes, custom one-off art pieces, replacement parts, as well as production batches of hundreds or thousands of units.',
      },
      {
        id: 'faq-4',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major debit/credit cards, UPI (Google Pay, PhonePe, Paytm), Net Banking through Razorpay, as well as Cash on Delivery (COD) for eligible domestic shipments across India.',
      },
    ],
  },
  {
    id: 'materials-printing',
    name: 'Materials & Print Technology',
    items: [
      {
        id: 'faq-5',
        question: 'Which materials do you print with?',
        answer: 'We print with PLA (everyday prototypes and display items), PETG (heat & impact resistant), ABS/ASA (automotive and UV-resistant outdoor use), TPU (flexible rubber-like parts), Nylon/PA-CF (ultra-strong engineering components), and High-Detail UV Resin for miniatures and dental prototypes.',
      },
      {
        id: 'faq-6',
        question: 'What is the difference between FDM and Resin (SLA/MSLA)?',
        answer: 'FDM (Fused Deposition Modeling) melts thermoplastic filament layer-by-layer; it is ideal for structural parts, functional prototypes, and cost-effective larger objects. Resin printing cures liquid photopolymers with UV light, achieving microscopic layer heights (0.025mm) with near-injection-molded surface smoothness for intricate figurines and precision prototypes.',
      },
      {
        id: 'faq-7',
        question: 'What dimensional tolerances can you achieve?',
        answer: 'For standard FDM printing, tolerances are typically ±0.2 mm or ±0.2% (whichever is greater). For precision resin and metal printing, tolerances can reach ±0.05 mm to ±0.1 mm.',
      },
    ],
  },
  {
    id: 'shipping-delivery',
    name: 'Shipping & Delivery',
    items: [
      {
        id: 'faq-8',
        question: 'How long will it take to receive my order?',
        answer: 'Standard in-stock catalog products ship within 1–2 business days. Custom 3D prints typically require 2–4 business days for slicing, printing, post-curing, and quality inspection. Transit via express courier takes 3–5 business days pan-India.',
      },
      {
        id: 'faq-9',
        question: 'Do you ship all across India?',
        answer: 'Yes, we provide pan-India delivery to all serviceable pin codes via trusted logistics partners including Bluedart, Delhivery, and DTDC with end-to-end tracking.',
      },
      {
        id: 'faq-10',
        question: 'How are fragile prints packaged?',
        answer: 'Every print is wrapped in protective anti-static foam or high-density bubble wrap, secured with custom cushioning inside heavy-duty corrugated cartons to ensure zero damage during transit.',
      },
    ],
  },
  {
    id: 'custom-design-ndas',
    name: 'Custom Design, IP & Confidentiality',
    items: [
      {
        id: 'faq-11',
        question: 'Will my 3D design files and IP remain confidential?',
        answer: 'Yes, 100%. We take intellectual property rights very seriously. We never share, publish, or sell your 3D models without your explicit permission. We are also happy to sign a Non-Disclosure Agreement (NDA) before reviewing your proprietary files.',
      },
      {
        id: 'faq-12',
        question: 'What if my printed part arrives damaged or defective?',
        answer: 'Every job undergoes rigorous dimensional and visual quality checks before dispatch. In the unlikely event that your item arrives defective or damaged during shipping, contact us with photos within 7 days of delivery and we will reprint and reship your order free of charge.',
      },
    ],
  },
];

export default async function FaqPage() {
  let categories: any[] = [];
  try {
    const dbCategories = await prisma.faqCategory.findMany({
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
    if (dbCategories && dbCategories.length > 0 && dbCategories.some(c => c.items.length > 0)) {
      categories = dbCategories;
    } else {
      categories = defaultFaqCategories;
    }
  } catch {
    categories = defaultFaqCategories;
  }

  return <FaqClient categories={categories} />;
}

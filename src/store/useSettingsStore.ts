import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StoreSettings {
  // Store Identity
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeTagline: string;
  footerAboutText: string;

  // Pricing & Delivery
  currency: string;
  codFee: number;
  gstRate: number;
  freeShippingAbove: number;
  minOrderAmount: number;

  // Homepage
  heroHeadline: string;
  heroSubheadline: string;
  announcementBarEnabled: boolean;
  announcementBar: string;
  announcementBarColor: string;
  
  // Popup Banner
  popupEnabled: boolean;
  popupTitle: string;
  popupText: string;
  popupImage: string;
  popupLink: string;
  popupLinkText: string;
  popupDelaySeconds: number;

  // Social Links
  socialTwitter: string;
  socialInstagram: string;
  socialLinkedIn: string;
  socialYouTube: string;
  socialFacebook: string;

  // SEO
  seoTitle: string;
  seoDescription: string;

  // Integrations
  whatsappNumber: string;

  // Policies (markdown/text)
  returnPolicy: string;
  shippingPolicy: string;
  privacyPolicy: string;
  termsOfService: string;

  // System
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  lowStockThreshold: number;
  orderEmailNotifications: boolean;
}

const defaultSettings: StoreSettings = {
  storeName: 'MechArt 3D',
  storeEmail: 'hello@mechart3d.com',
  storePhone: '+91 99999 99999',
  storeAddress: 'India',
  storeTagline: 'Premium 3D Printing & Custom Design',
  footerAboutText: 'Where Fundamental binds with the Artistic and brings the product to exist. Premium 3D printing, custom design, and engineering solutions.',

  currency: 'INR',
  codFee: 50,
  gstRate: 18,
  freeShippingAbove: 999,
  minOrderAmount: 0,

  heroHeadline: 'Print the Future.',
  heroSubheadline: 'Custom 3D prints, premium figurines, and engineering solutions — all in one place.',
  announcementBarEnabled: false,
  announcementBar: '🚀 Free shipping on orders above ₹999! Use code FREESHIP',
  announcementBarColor: 'bg-primary-600',

  popupEnabled: false,
  popupTitle: 'Special Offer!',
  popupText: 'Sign up today and get 10% off your first 3D print order.',
  popupImage: '',
  popupLink: '/auth/register',
  popupLinkText: 'Claim Offer',
  popupDelaySeconds: 3,

  socialTwitter: '',
  socialInstagram: '',
  socialLinkedIn: '',
  socialYouTube: '',
  socialFacebook: '',

  seoTitle: 'MechArt 3D — Premium 3D Printing & Custom Design',
  seoDescription: 'Shop premium 3D printed products, order custom designs, and explore 3D printing services.',

  whatsappNumber: '+91 99999 99999',

  returnPolicy: '## Return Policy\n\nWe accept returns within 7 days of delivery for defective or damaged items. Custom orders are non-refundable.',
  shippingPolicy: '## Shipping Policy\n\nAll orders are processed within 2-3 business days. Standard delivery takes 5-7 business days.',
  privacyPolicy: '## Privacy Policy\n\nWe respect your privacy and are committed to protecting your personal data.',
  termsOfService: '## Terms of Service\n\nBy using our service, you agree to these terms and conditions.',

  maintenanceMode: false,
  allowRegistrations: true,
  lowStockThreshold: 5,
  orderEmailNotifications: true,
};

interface SettingsStore {
  settings: StoreSettings;
  setSettings: (newSettings: Partial<StoreSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'mechart-settings',
    }
  )
);

export { defaultSettings };

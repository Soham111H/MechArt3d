"use client";

import { useCartStore } from "@/store/useCartStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Truck, Lock, ArrowLeft, Loader2, CheckCircle2, Tag, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import Script from "next/script";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { settings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod]   = useState<"COD" | "ONLINE">("ONLINE");
  const ENABLE_ONLINE_PAYMENT               = true; // Feature flag for Razorpay

  const [couponCode, setCouponCode]         = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg]           = useState('');
  const [couponOk, setCouponOk]             = useState<boolean | null>(null);
  const [couponLoading, setCouponLoading]   = useState(false);
  const [appliedCoupon, setAppliedCoupon]   = useState('');

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
    if (useCartStore.getState().items.length === 0 && !success) {
      router.push("/cart");
    }

    if (session?.user) {
      // Split name safely
      const nameParts = (session.user.name || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || session.user.email || ""
      }));

      // Fetch profile for phone, and address for shipping
      Promise.all([
        fetch("/api/user/profile").then(r => r.ok ? r.json() : null),
        fetch("/api/user/address").then(r => r.ok ? r.json() : [])
      ]).then(([profile, addresses]) => {
        if (profile?.phone) {
          setFormData(prev => ({ ...prev, phone: prev.phone || profile.phone }));
        }
        if (addresses && addresses.length > 0) {
          const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
          setFormData(prev => ({
            ...prev,
            addressLine1: prev.addressLine1 || defaultAddr.line1 || "",
            addressLine2: prev.addressLine2 || defaultAddr.line2 || "",
            city: prev.city || defaultAddr.city || "",
            state: prev.state || defaultAddr.state || "",
            pincode: prev.pincode || defaultAddr.pincode || "",
          }));
        }
      }).catch(() => {}); // ignore fetch errors on autofill
    }
  }, [router, success, session]);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const tax = subtotal * (settings.gstRate / 100);
  const isFreeShipping = subtotal >= settings.freeShippingAbove;
  const shipping = isFreeShipping || paymentMethod === 'ONLINE' ? 0 : settings.codFee;
  const discount = couponDiscount;
  const total = subtotal + tax + shipping - discount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.toUpperCase(), subtotal }),
      });
      const data = await res.json();
      setCouponOk(data.valid);
      setCouponMsg(data.message);
      if (data.valid) {
        setCouponDiscount(data.discountAmount);
        setAppliedCoupon(couponCode.toUpperCase());
      } else {
        setCouponDiscount(0);
        setAppliedCoupon('');
      }
    } catch {
      setCouponMsg('Failed to validate coupon.');
      setCouponOk(false);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Cart is empty");
    
    setLoading(true);

    try {
      const payload = {
        items: items.map(i => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          price: i.price
        })),
        shippingAddress: formData,
        paymentMethod,
        couponCode: appliedCoupon || undefined,
      };

      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (paymentMethod === 'ONLINE' && data.orderId) {
        // Step 1: Create Razorpay Order
        const rpRes = await fetch("/api/orders/create-razorpay-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total, internalOrderId: data.orderId })
        });
        const rpData = await rpRes.json();
        if (!rpRes.ok) throw new Error(rpData.error || "Failed to initialize payment");

        // Step 2: Open Razorpay Checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: rpData.amount,
          currency: rpData.currency,
          name: settings.storeName || "MechArt 3D",
          description: "Order Payment",
          order_id: rpData.id,
          handler: async function (response: any) {
            // Step 3: Verify Payment
            const verifyRes = await fetch("/api/orders/verify-razorpay-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                internalOrderId: data.orderId,
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setOrderId(data.orderId);
              setSuccess(true);
              clearCart();
              setLoading(false);
            } else {
              toast.error("Payment verification failed");
              setLoading(false);
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone,
          },
          theme: { color: "#4f46e5" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any) {
          toast.error(response.error?.description || "Payment failed");
          setLoading(false);
        });
        rzp.open();
      } else {
        setOrderId(data.orderId);
        setSuccess(true);
        clearCart(); 
        setLoading(false);
      }
      
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  // Success State View
  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-fade-in-up">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 text-center">Order Confirmed!</h1>
        <p className="text-slate-500 text-center max-w-md mb-8">
          Thank you for your purchase. Your order <span className="font-bold text-slate-900 dark:text-white">#{orderId?.slice(-6).toUpperCase()}</span> has been placed successfully and will be shipped soon.
        </p>
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
            <ArrowLeft size={20} className="text-slate-500" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            Checkout
          </h1>
        </div>

        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in-up">
          
          {/* Left: Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Shipping Address */}
            <div className="card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <Truck size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Shipping Address</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">First Name *</label>
                  <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Last Name *</label>
                  <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone Number *</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Address Line 1 *</label>
                  <input required type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Street address, company name, c/o" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Address Line 2</label>
                  <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Apartment, suite, unit, building, floor, etc." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">City *</label>
                  <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">State *</label>
                  <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Pincode *</label>
                  <input required type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment Method</h2>
              </div>
              
              <div className="space-y-4">
                <div 
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-4 border-2 rounded-xl flex items-center gap-4 cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-primary-300'}`}
                >
                  <div className={`w-6 h-6 rounded-full border-4 flex-shrink-0 ${paymentMethod === 'COD' ? 'border-primary-500 bg-white' : 'border-slate-300 dark:border-slate-600'}`} />
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Cash on Delivery (COD)</h3>
                    <p className="text-sm text-slate-500 mt-1">Pay with cash when your order is delivered. A ₹{settings.codFee} handling fee is applied (Free above ₹{settings.freeShippingAbove}).</p>
                  </div>
                </div>

                {ENABLE_ONLINE_PAYMENT && (
                  <div 
                    onClick={() => setPaymentMethod("ONLINE")}
                    className={`p-4 border-2 rounded-xl flex items-center gap-4 cursor-pointer transition-colors ${paymentMethod === 'ONLINE' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-primary-300'}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-4 flex-shrink-0 ${paymentMethod === 'ONLINE' ? 'border-primary-500 bg-white' : 'border-slate-300 dark:border-slate-600'}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <CreditCard size={18} /> Online Payment
                        </h3>
                        <div className="flex gap-1">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">UPI</span>
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">CARDS</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">Pay securely via Razorpay (UPI, Cards, NetBanking). No extra fee.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Coupon Code */}
            <div className="card p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Tag size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Promo Code</h2>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponOk(null); setCouponMsg(''); }}
                  placeholder="Enter coupon code"
                  disabled={!!appliedCoupon}
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-mono uppercase text-sm disabled:opacity-60"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => { setCouponDiscount(0); setAppliedCoupon(''); setCouponCode(''); setCouponOk(null); setCouponMsg(''); }}
                    className="px-4 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-5 py-3 btn-primary text-sm disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                )}
              </div>
              {couponMsg && (
                <p className={`mt-3 text-sm font-medium ${couponOk ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {couponMsg}
                </p>
              )}
            </div>

          </div>

          {/* Right: Order Summary */}
          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm sticky top-24">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Order Summary</h2>
            
            {/* Items (Compact) */}
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-800" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-slate-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{item.quantity}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{item.name}</h4>
                    {item.variantName && <p className="text-xs text-slate-500">Variant: {item.variantName}</p>}
                    <p className="text-sm font-black mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-6 text-sm font-medium border-t border-slate-100 dark:border-slate-800 pt-6">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-900 dark:text-white">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Tax ({settings.gstRate}% GST)</span>
                <span className="text-slate-900 dark:text-white">₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping (COD)</span>
                <span className="text-slate-900 dark:text-white">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400 font-bold">
                  <span>Discount ({appliedCoupon})</span>
                  <span>-₹{discount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Lock size={20} />}
              {loading ? "Processing Order..." : `Place Order (${paymentMethod === 'ONLINE' ? 'Pay Now' : 'COD'})`}
            </button>
            <p className="text-xs text-center text-slate-500 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck size={14} /> Safe and secure checkout
            </p>
          </div>

        </form>
      </div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}

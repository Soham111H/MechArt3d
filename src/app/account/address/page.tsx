import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MapPin, Plus, Star } from "lucide-react";
import Button from "@/components/ui/Button";

export default async function AddressBookPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Address Book</h1>
          <p className="text-slate-500 mt-1">Manage your delivery and billing addresses.</p>
        </div>
        <Button className="gap-2">
          <Plus size={18} /> Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="card p-12 text-center flex flex-col items-center justify-center border-dashed">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <MapPin size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No addresses saved</h3>
          <p className="text-slate-500 mb-6 max-w-md">You haven&apos;t added any shipping addresses yet. Add one now to make checkout faster.</p>
          <Button variant="outline" className="gap-2">
            <Plus size={18} /> Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className={`card p-6 border-2 transition-colors ${address.isDefault ? "border-primary-500" : "border-transparent"}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{address.label}</span>
                  {address.isDefault && (
                    <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star size={10} className="fill-current" /> Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <button className="text-primary-600 hover:underline">Edit</button>
                  <button className="text-red-500 hover:underline">Delete</button>
                </div>
              </div>
              
              <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-1">
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>{address.city}, {address.state} {address.pincode}</p>
                <p>{address.country}</p>
              </div>

              {!address.isDefault && (
                <button className="mt-6 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

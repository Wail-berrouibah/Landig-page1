import { CONFIG, formatPrice } from "@/lib/config";

export default function StickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-5 py-3 backdrop-blur-sm md:hidden">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-gold">
            {formatPrice(CONFIG.product.price)}
          </span>
          {CONFIG.product.showPayOnDelivery && (
            <p className="text-xs text-muted">Paiement à la livraison</p>
          )}
        </div>
        <a
          href="#commander"
          className="inline-flex items-center rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-light"
        >
          Commander
        </a>
      </div>
    </div>
  );
}

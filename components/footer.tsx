import { CONFIG } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="border-t border-border pb-24 md:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-6 text-xs text-muted md:flex-row">
        <span>&copy; {new Date().getFullYear()} TechPro Algérie.</span>
        <span className="text-center">
          Livraison gratuite dans toute l&apos;Algérie • Garantie {CONFIG.warranty} •{" "}
          {CONFIG.returnPolicy}
        </span>
      </div>
    </footer>
  );
}

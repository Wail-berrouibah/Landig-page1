"use client";

import { useState, useEffect } from "react";
import { CONFIG, formatPrice } from "@/lib/config";
import { fetchCommunes, type Commune } from "@/lib/api";

type FormData = {
  name: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  quantity: number;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormData | "wilaya", string>>;
type FormTouched = Partial<Record<keyof FormData | "wilaya", boolean>>;

const INITIAL: FormData = {
  name: "",
  phone: "",
  wilaya: "",
  commune: "",
  address: "",
  quantity: 1,
  notes: "",
};

function validatePhone(v: string): string {
  const cleaned = v.replace(/\s+/g, "");
  if (!cleaned) return "Numéro de téléphone requis";
  if (!/^(\+213|0|213)?[5-9]\d{8}$/.test(cleaned))
    return "Format : +213 5XX XX XX XX ou 05XX XX XX XX";
  return "";
}

function validateForm(data: FormData): FormErrors {
  const e: FormErrors = {};
  if (!data.name.trim()) e.name = "Nom complet requis";
  const phoneErr = validatePhone(data.phone);
  if (phoneErr) e.phone = phoneErr;
  if (!data.wilaya) e.wilaya = "Wilaya requise";
  if (!data.commune.trim()) e.commune = "Commune requise";
  if (!data.address.trim()) e.address = "Adresse requise";
  return e;
}

function getDeliveryEstimate(wilayaName: string): string {
  const fast = ["alger", "oran", "constantine", "annaba", "sétif", "blida", "tizi ouzou", "bejaia", "tiaret", "biskra"];
  const name = wilayaName.toLowerCase();
  if (fast.some((f) => name.includes(f) || f.includes(name))) {
    return "Livraison estimée : 2 à 4 jours ouvrés";
  }
  return "Livraison estimée : 5 à 7 jours ouvrés";
}

export default function OrderForm() {
  const [data, setData] = useState<FormData>(INITIAL);
  const [touched, setTouched] = useState<FormTouched>({});
  const [submitted, setSubmitted] = useState(false);

  const [communes, setCommunes] = useState<Commune[]>([]);

  const [selectedWilayaCode, setSelectedWilayaCode] = useState<number | null>(null);
  const [selectedWilayaName, setSelectedWilayaName] = useState("");

  useEffect(() => {
    if (!selectedWilayaCode) {
      setCommunes([]);
      return;
    }
    fetchCommunes(selectedWilayaCode).then(setCommunes);
  }, [selectedWilayaCode]);

  const errors = submitted ? validateForm(data) : {};
  const isValid = submitted && Object.keys(errors).length === 0;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    if (name === "wilaya") {
      const wilaya = CONFIG.wilayas.find((w) => w.code === Number(value));
      setSelectedWilayaCode(wilaya?.code ?? null);
      setSelectedWilayaName(wilaya?.name ?? "");
      setData((prev) => ({ ...prev, wilaya: value, commune: "" }));
    } else if (name === "quantity") {
      setData((prev) => ({ ...prev, quantity: Math.min(3, Math.max(1, Number(value) || 1)) }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validateForm(data);
    if (Object.keys(errs).length > 0) return;

    const order = {
      name: data.name,
      phone: data.phone,
      wilaya: selectedWilayaName || data.wilaya,
      commune: data.commune,
      address: data.address,
      notes: data.notes,
      quantity: data.quantity,
      total: CONFIG.product.price * data.quantity,
    };

    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          alert(`Commande confirmée !\n\nRéf : ${res.order.id}\nTotal : ${formatPrice(res.order.total)}\n\nUn conseiller vous contactera sous 24h.`);
        } else {
          alert("Erreur lors de l'enregistrement de la commande. Veuillez réessayer.");
        }
      })
      .catch(() => {
        alert("Erreur réseau. Veuillez réessayer.");
      });

    setData(INITIAL);
    setSubmitted(false);
    setTouched({});
    setSelectedWilayaCode(null);
    setSelectedWilayaName("");
    setCommunes([]);
  }

  const fieldError = (name: keyof FormData | "wilaya") => {
    if (submitted || touched[name]) {
      return errors[name] || "";
    }
    return "";
  };

  const inputClass = (name: keyof FormData | "wilaya") =>
    `w-full rounded-lg border bg-surface px-4 py-2.5 text-sm text-text transition-colors placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/30 ${
      fieldError(name) ? "border-error" : "border-border"
    }`;

  return (
    <section
      id="commander"
      className="mx-auto max-w-2xl scroll-mt-20 px-5 py-12 md:py-20"
    >
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
        Commander
      </h2>
      <p className="mt-2 text-sm text-muted">
        Remplissez le formulaire ci-dessous. Un conseiller vous contactera dans
        les plus brefs délais pour confirmer votre commande.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Nom complet <span className="text-error">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Ahmed Benali"
            value={data.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass("name")}
          />
          {fieldError("name") && (
            <p className="mt-1 text-xs text-error">{fieldError("name")}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium">
            Numéro de téléphone <span className="text-error">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+213 5XX XX XX XX"
            value={data.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass("phone")}
          />
          {fieldError("phone") && (
            <p className="mt-1 text-xs text-error">{fieldError("phone")}</p>
          )}
        </div>

        {/* Wilaya */}
        <div>
          <label htmlFor="wilaya" className="mb-1 block text-sm font-medium">
            Wilaya <span className="text-error">*</span>
          </label>
          <select
            id="wilaya"
            name="wilaya"
            value={data.wilaya}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass("wilaya")}
          >
            <option value="">-- Veuillez choisir une option --</option>
            <optgroup label="Nouvelles Wilayas (2026)">
              {CONFIG.wilayas.filter((w) => w.group === "new").map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Wilayas Originales">
              {CONFIG.wilayas.filter((w) => w.group === "original").map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </optgroup>
          </select>
          {fieldError("wilaya") && (
            <p className="mt-1 text-xs text-error">{fieldError("wilaya")}</p>
          )}
          {selectedWilayaName && !fieldError("wilaya") && (
            <p className="mt-1 text-xs text-muted">
              Wilaya sélectionnée : <strong>{selectedWilayaName}</strong>
            </p>
          )}
          {selectedWilayaName && (
            <p className="mt-1 text-xs text-success">
              {getDeliveryEstimate(selectedWilayaName)}
            </p>
          )}
        </div>

        {/* Commune */}
        <div>
          <label htmlFor="commune" className="mb-1 block text-sm font-medium">
            Commune <span className="text-error">*</span>
          </label>
          {communes.length > 0 ? (
            <select
              id="commune"
              name="commune"
              value={data.commune}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("commune")}
            >
              <option value="">Sélectionnez une commune</option>
              {communes.map((c, i) => (
                <option key={i} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="commune"
              name="commune"
              type="text"
              placeholder="Saisissez votre commune"
              value={data.commune}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("commune")}
            />
          )}
          {fieldError("commune") && (
            <p className="mt-1 text-xs text-error">{fieldError("commune")}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="mb-1 block text-sm font-medium">
            Adresse de livraison <span className="text-error">*</span>
          </label>
          <input
            id="address"
            name="address"
            type="text"
            placeholder="Rue, numéro, cité…"
            value={data.address}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass("address")}
          />
          {fieldError("address") && (
            <p className="mt-1 text-xs text-error">{fieldError("address")}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="mb-1 block text-sm font-medium">
            Quantité
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setData((d) => ({ ...d, quantity: Math.max(1, d.quantity - 1) }))
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-lg transition-colors hover:border-text"
              aria-label="Diminuer la quantité"
            >
              –
            </button>
            <span className="w-8 text-center text-sm font-medium">
              {data.quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                setData((d) => ({ ...d, quantity: Math.min(3, d.quantity + 1) }))
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-lg transition-colors hover:border-text"
              aria-label="Augmenter la quantité"
              disabled={data.quantity >= 3}
            >
              +
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium">
            Notes (optionnel)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Une question ou une demande particulière ?"
            value={data.notes}
            onChange={handleChange}
            className={inputClass("notes")}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitted && !isValid}
          className="w-full rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          Commander – {formatPrice(CONFIG.product.price * data.quantity)}
        </button>
        <p className="text-center text-xs text-muted">
          Vos données restent confidentielles.
        </p>
      </form>
    </section>
  );
}

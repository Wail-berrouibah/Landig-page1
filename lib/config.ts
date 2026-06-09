export interface Spec {
  label: string;
  value: string;
}

export interface Benefit {
  icon: string;
  text: string;
}

export interface FAQItem {
  q: string;
  r: string;
}

export interface WilayaItem {
  code: number;
  name: string;
  group: "original" | "new";
}

export const CONFIG = {
  admin: {
    sessionDuration: 60 * 60 * 24,
  },
  product: {
    name: "TechPro 15 Pro",
    tagline:
      "Performances optimales pour le travail, les études et le gaming. Livré gratuitement en Algérie.",
    price: 89900,
    currency: "DA",
    showPayOnDelivery: true,
  },
  specs: [
    { label: "Processeur", value: "Intel Core i5-12450H (8 cœurs, up to 4.4 GHz)" },
    { label: "RAM", value: "16 Go DDR4 (3200 MHz)" },
    { label: "Stockage", value: "512 Go SSD NVMe M.2" },
    { label: "Carte graphique", value: "NVIDIA GeForce RTX 2050 (4 Go GDDR6)" },
    { label: "Écran", value: '15.6" FHD IPS (1920×1080, 60 Hz)' },
    { label: "Batterie", value: "45 Wh – jusqu’à 6 h d’autonomie" },
    { label: "Poids", value: "1,8 kg" },
  ] satisfies Spec[],
  benefits: [
    { icon: "bolt", text: "Fluidité au quotidien – Travail, cours et jeux sans ralentissement." },
    { icon: "screen", text: "Confort visuel – Écran IPS FHD pour travailler sans fatigue." },
    { icon: "laptop", text: "Ultra portable – 1,8 kg, facile à emporter partout." },
    { icon: "plug", text: "Prêt à l’emploi – Windows 11 installé, pilotes inclus." },
  ] satisfies Benefit[],
  proofPoints: [
    { icon: "", text: "Livraison gratuite partout en Algérie (48 wilayas)" },
    { icon: "", text: "Garantie constructeur 2 ans" },
    { icon: "", text: "Retour gratuit sous 15 jours" },
  ],
  warranty: "2 ans constructeur",
  deliveryTime: "3 à 7 jours ouvrés selon votre wilaya",
  returnPolicy: "Retour gratuit sous 15 jours",
  wilayas: [
    // New Wilayas (2026)
    { code: 59, name: "Aflou", group: "new" },
    { code: 60, name: "Aïn Oussera", group: "new" },
    { code: 61, name: "Barika", group: "new" },
    { code: 62, name: "Bir El Ater", group: "new" },
    { code: 63, name: "Bou-Saada", group: "new" },
    { code: 64, name: "El Abiodh Sidi Cheikh", group: "new" },
    { code: 65, name: "El Aricha", group: "new" },
    { code: 66, name: "El Kantara", group: "new" },
    { code: 67, name: "Ksar Chellala", group: "new" },
    { code: 68, name: "Ksar El Boukhari", group: "new" },
    { code: 69, name: "Messaad", group: "new" },
    // Original Wilayas
    { code: 1, name: "Adrar", group: "original" },
    { code: 44, name: "Aïn Defla", group: "original" },
    { code: 46, name: "Aïn Témouchent", group: "original" },
    { code: 16, name: "Alger", group: "original" },
    { code: 23, name: "Annaba", group: "original" },
    { code: 5, name: "Batna", group: "original" },
    { code: 8, name: "Béchar", group: "original" },
    { code: 6, name: "Béjaïa", group: "original" },
    { code: 7, name: "Biskra", group: "original" },
    { code: 9, name: "Blida", group: "original" },
    { code: 50, name: "Bordj Badji Mokhtar", group: "original" },
    { code: 34, name: "Bordj Bou Arréridj", group: "original" },
    { code: 10, name: "Bouira", group: "original" },
    { code: 35, name: "Boumerdès", group: "original" },
    { code: 2, name: "Chlef", group: "original" },
    { code: 25, name: "Constantine", group: "original" },
    { code: 56, name: "Djanet", group: "original" },
    { code: 17, name: "Djelfa", group: "original" },
    { code: 32, name: "El Bayadh", group: "original" },
    { code: 57, name: "El M'Ghair", group: "original" },
    { code: 58, name: "El Menia", group: "original" },
    { code: 39, name: "El Oued", group: "original" },
    { code: 36, name: "El Tarf", group: "original" },
    { code: 47, name: "Ghardaïa", group: "original" },
    { code: 24, name: "Guelma", group: "original" },
    { code: 33, name: "Illizi", group: "original" },
    { code: 54, name: "In Guezzam", group: "original" },
    { code: 53, name: "In Salah", group: "original" },
    { code: 18, name: "Jijel", group: "original" },
    { code: 40, name: "Khenchela", group: "original" },
    { code: 3, name: "Laghouat", group: "original" },
    { code: 29, name: "Mascara", group: "original" },
    { code: 26, name: "Médéa", group: "original" },
    { code: 43, name: "Mila", group: "original" },
    { code: 27, name: "Mostaganem", group: "original" },
    { code: 28, name: "M'Sila", group: "original" },
    { code: 45, name: "Naâma", group: "original" },
    { code: 31, name: "Oran", group: "original" },
    { code: 30, name: "Ouargla", group: "original" },
    { code: 51, name: "Ouled Djellal", group: "original" },
    { code: 4, name: "Oum El Bouaghi", group: "original" },
    { code: 48, name: "Relizane", group: "original" },
    { code: 20, name: "Saïda", group: "original" },
    { code: 19, name: "Sétif", group: "original" },
    { code: 22, name: "Sidi Bel Abbès", group: "original" },
    { code: 21, name: "Skikda", group: "original" },
    { code: 41, name: "Souk Ahras", group: "original" },
    { code: 11, name: "Tamanrasset", group: "original" },
    { code: 12, name: "Tébessa", group: "original" },
    { code: 14, name: "Tiaret", group: "original" },
    { code: 49, name: "Timimoun", group: "original" },
    { code: 37, name: "Tindouf", group: "original" },
    { code: 42, name: "Tipaza", group: "original" },
    { code: 38, name: "Tissemsilt", group: "original" },
    { code: 15, name: "Tizi Ouzou", group: "original" },
    { code: 13, name: "Tlemcen", group: "original" },
    { code: 55, name: "Touggourt", group: "original" },
  ] satisfies WilayaItem[],
  faq: [
    {
      q: "Comment puis-je payer ?",
      r: "Vous pouvez payer à la livraison (espèces ou carte bancaire selon le livreur) ou par virement bancaire avant expédition. Un paiement en ligne par carte sera bientôt disponible.",
    },
    {
      q: "Quel est le délai de livraison ?",
      r: "La livraison prend 3 à 7 jours ouvrés selon votre wilaya. Les grandes villes (Alger, Oran, Constantine) sont livrées sous 48–72 h. Vous recevrez un numéro de suivi dès l’expédition.",
    },
    {
      q: "Quelle est la garantie ?",
      r: "Le TechPro 15 Pro est couvert par une garantie constructeur de 2 ans (pièces et main-d’œuvre). La garantie est valable dans toute l’Algérie.",
    },
    {
      q: "Qu’est-ce qui est inclus dans la boîte ?",
      r: "La boîte contient : le PC TechPro 15 Pro, le chargeur secteur, un guide de démarrage rapide, et la carte de garantie. Le PC est livré avec Windows 11 préinstallé.",
    },
    {
      q: "Puis-je retourner ou échanger le produit ?",
      r: "Oui, vous disposez de 15 jours après réception pour retourner ou échanger le produit, sous réserve qu’il soit dans son état d’origine (emballage intact, accessoires complets). Le retour est gratuit.",
    },
  ] satisfies FAQItem[],
} as const;

export function formatPrice(price: number | undefined | null): string {
  if (price == null || isNaN(price)) return "0 DA";
  return price.toLocaleString("fr-DZ") + " DA";
}

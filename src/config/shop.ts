/**
 * Centralizovana konfiguracija prodavnice za Storefront Beauty.
 * Određuje aktivni shop prema varijabli NEXT_PUBLIC_SHOP_ID (npr. 'sminka').
 */

export interface CategoryConfig {
  name: string
  handle: string
  icon: string // Exact Lucide icon string
  description?: string
}

export interface ShopConfig {
  id: string
  name: string
  channel: {
    name: string
    handle: string
    description?: string
  }
  rootCategory: {
    name: string
    handle: string
  }
  categories: CategoryConfig[]
  branding: {
    logoText: string
    subnavLabel: string
    livePromo: {
      title: string
      badge: string
      link: string
    }
    dealsLabel: string
  }
  defaultPort: number
}

export const SHOPS: Record<string, ShopConfig> = {
  alati: {
    id: "alati",
    name: "Alati & Mašine",
    channel: {
      name: "Alati Shop",
      handle: "alati",
      description: "Prodajni kanal za električne, akumulatorske i ručne alate",
    },
    rootCategory: {
      name: "Alati i Mašine",
      handle: "alati",
    },
    categories: [
      { name: "Akumulatorski alati", handle: "aku-alati", icon: "Drill" },
      { name: "Ručni alati", handle: "rucni-alati", icon: "Wrench" },
      { name: "Električni alati", handle: "elektricni-alati", icon: "Hammer" },
      { name: "Zaštitna oprema", handle: "zastitna-oprema", icon: "ShieldAlert" },
      { name: "Radionica i Garaža", handle: "radionica", icon: "Warehouse" },
      { name: "Vrt i Bašta", handle: "vrt-i-basta", icon: "Trees" },
      { name: "Pribor & Oprema", handle: "pribor", icon: "Boxes" },
    ],
    branding: {
      logoText: "ALATI",
      subnavLabel: "Kategorije alata",
      livePromo: {
        title: "Alati",
        badge: "Uživo",
        link: "/store",
      },
      dealsLabel: "Najbolje ponude",
    },
    defaultPort: 8000,
  },
  sminka: {
    id: "sminka",
    name: "Šminka & Kozmetika",
    channel: {
      name: "Šminka & Kozmetika Shop",
      handle: "sminka",
      description: "Prodajni kanal za njegu lica, tijela i make-up proizvode",
    },
    rootCategory: {
      name: "Kozmetika i Ljepota",
      handle: "kozmetika",
    },
    categories: [
      { name: "Njega lica i Serumi", handle: "njega-lica", icon: "Sparkles" },
      { name: "Šminka za Usne", handle: "sminka-za-usne", icon: "Heart" },
      { name: "Sjenila i Palete", handle: "sjenila-palete", icon: "Palette" },
      { name: "Puderi i Korektori", handle: "puderi-korektori", icon: "Smile" },
      { name: "Njega Tijela i Kose", handle: "njega-tijela", icon: "Droplets" },
    ],
    branding: {
      logoText: "BEAUTY",
      subnavLabel: "Kategorije ljepote",
      livePromo: {
        title: "Beauty",
        badge: "Uživo",
        link: "/store",
      },
      dealsLabel: "Top Ponude",
    },
    defaultPort: 8001,
  },
}

// Trenutno aktivni shop na ovom frontendu (default sminka)
const currentShopId =
  process.env.NEXT_PUBLIC_SHOP_ID ||
  process.env.NEXT_PUBLIC_STORE_CATEGORY_CHANNEL ||
  "sminka"

export const activeShop: ShopConfig = SHOPS[currentShopId] || SHOPS.sminka

export const getAllShops = (): ShopConfig[] => Object.values(SHOPS)

export const getAllShopRootHandles = (): string[] =>
  getAllShops().map((s) => s.rootCategory.handle)

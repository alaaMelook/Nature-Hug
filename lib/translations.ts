import { Heart, Rocket, Box, Zap } from "lucide-react";

type LangKey = "en" | "ar";

export const translations: Record<
  LangKey,
  {
    [key: string]: any; // allow strings, arrays, objects
  }
> = {
  en: {
    home: "Home",
    shop: "Shop",
    about: "About",
    contact: "Contact",
    cart: "Cart",
    emptyCart: "Your cart is empty!",
    startAdding: "Start adding products to your cart to see them here.",
    shopNow: "Shop now",
    quantity: "Quantity",
    each: "each",
    subtotal: "Subtotal",
    checkoutInfo: "Taxes and shipping calculated at checkout.",
    proceedToCheckout: "Proceed to Checkout",
    loadingCart: "Loading your cart...",
    remove: "Remove item",
    backToShop: "Back to shop",
    error: "Error loading products",
    noProd: "No products available",
    noImg: "No Image",
    outOfStock: "Out Of Stock",
    addToCart: "Add to Cart",
    featuredProducts: "Featured Products",
    learnMore: "Learn More",
    allRightsReserved: "All rights reserved.",
    heroTitle: "Where every ingredient is a promise.",
    heroDescription: "A gentle hug for your skin from nature itself.",
    addedLocal: "Added to local cart (login to sync).",
    addedServer: "Product added to cart!",
    features: [
      {
        icon: Heart,
        title: "Curated Selection",
        description: "Hand-picked items for quality and style.",
      },
      {
        icon: Rocket,
        title: "Fast Shipping",
        description: "Your order ships within 24 hours.",
      },
      {
        icon: Box,
        title: "Secure Packaging",
        description: "Items are securely packed and protected.",
      },
      {
        icon: Zap,
        title: "Exclusive Deals",
        description: "Access to special promotions and discounts.",
      },
    ],
  },
  ar: {
    home: "الرئيسية",
    shop: "المتجر",
    about: "من نحن",
    contact: "اتصل بنا",
    cart: "السلة",
    emptyCart: "عربتك فارغة!",
    startAdding: "ابدأ بإضافة المنتجات إلى عربتك لتراها هنا.",

    quantity: "الكمية",
    each: "لكل",
    subtotal: "الإجمالي",
    checkoutInfo: "سيتم احتساب الضرائب والشحن عند الدفع.",
    proceedToCheckout: "الانتقال إلى الدفع",
    loadingCart: "يتم تحميل عربتك...",
    remove: "إزالة العنصر",
    backToShop: "العودة للتسوق",
    error: "خطأ في تحميل المنتجات",
    noProd: "لا توجد منتجات متاحة",
    noImg: "لا توجد صورة",
    outOfStock: "غير متوفر",
    addToCart: "أضف إلى السلة",
    featuredProducts: "المنتجات المميزة",
    shopNow: "تسوق الآن",
    learnMore: "اعرف المزيد",
    allRightsReserved: "جميع الحقوق محفوظة.",
    heroTitle: "حيث كل مكون هو وعد.",
    heroDescription: "عناق لطيف لبشرتك من الطبيعة نفسها.",
    addedLocal: "اتضافت في سلة الضيف (سجّل دخول علشان تتزامن).",
    addedServer: "تم إضافة المنتج لعربة التسوق!",
    features: [
      {
        icon: Heart,
        title: "المنتجات المميزة",
        description: "منتجات مختارة بعناية للجودة والأناقة.",
      },
      {
        icon: Rocket,
        title: "توصيل سريع",
        description: "يتم شحن طلبك خلال 24 ساعة.",
      },
      {
        icon: Box,
        title: "تغليف آمن",
        description: "يتم تغليف المنتجات بشكل آمن ومحمي.",
      },
      {
        icon: Zap,
        title: "عروض حصرية",
        description: "الوصول إلى عروض وتخفيضات خاصة.",
      },
    ],
  },
};

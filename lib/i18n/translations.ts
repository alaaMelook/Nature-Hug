import { Heart, Rocket, Box, Zap } from "lucide-react";

export const resources: Record<string, any> = {
  en: {
    translation: {
      // Pagination
      prev: "Previous",
      next: "Next",
      // Filters / Product list
      filters: "Filters",
      category: "Category",
      all: "All",
      sortBy: "Sort by",
      nameAsc: "Name (A → Z)",
      nameDesc: "Name (Z → A)",
      priceAsc: "Price (Low → High)",
      priceDesc: "Price (High → Low)",
      ratingDesc: "Top Rated",
      inStockOnly: "In stock only",
      onSaleOnly: "On sale only",

      // Quantity controls
      decreaseQuantity: "Decrease quantity",
      increaseQuantity: "Increase quantity",

      // Reviews
      noReviews: "No reviews yet",
      reviews: "Reviews",
      // Product detail screen
      productNotFound: "Product not found.",
      fullDescription: "Full Description",
      materialsIngredients: "Materials / Ingredients",
      noMaterialsListed: "No materials listed.",
      bestFor: "Best For",
      precautions: "Precautions",
      na: "N/A",
      // reviews: "Reviews",
      // Currency
      EGP: "EGP",

      // Stock / availability
      only: "Only",
      leftInStock: "left in stock",
      inStock: "In stock",
      maxAvailable: "Maximum available",

      // Buy / Checkout actions
      BuyNow: "Buy Now",

      // Reviews / Add review
      reviewAddedSuccessfully: "Review added successfully",
      addYourReview: "Add your review",
      yourRating: "Your rating",
      yourComment: "Your comment",
      writeYourReviewHere: "Write your review here",
      submitting: "Submitting...",
      submitReview: "Submit review",
      loginToReview: "Login to review",
      loginNow: "Login now",

      // Confirmations
      confirmDeleteProduct: "Are you sure you want to delete this product?",
      // Navbar / auth
      orderHistory: "Order History",
      login: "Login",
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
          description: "<b>Hand-picked</b> items for <b>quality</b> and <b>style</b>.",
        },
        {
          icon: Rocket,
          title: "Fast Shipping",
          description: "Your order ships within <b>24 hours</b>.",
        },
        {
          icon: Box,
          title: "Secure Packaging",
          description: "Items are <b>securely packed</b> and <b>protected</b>.",
        },
        {
          icon: Zap,
          title: "Exclusive Deals",
          description: "Access to <b>special promotions</b> and <b>discounts</b>.",
        },
      ],
      // Common
      dashboard: "Dashboard",
      customers: "Customers",
      materials: "Materials",
      products: "Products",
      orders: "Orders",
      analytics: "Analytics",
      people: "People",
      finance: "Finance",
      reports: "Reports",
      settings: "Settings",
      profile: "Profile",
      logout: "Logout",
      backToSite: "Back to Site",
      welcomeBack: "Welcome back",
      adminPanel: "Admin Panel",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      search: "Search",
      status: "Status",
      actions: "Actions",

      // Materials
      inventory: "Inventory",
      suppliers: "Suppliers",
      production: "Production",
      bom: "Bill of Materials",
      costing: "Costing",
      movements: "Movements",

      // Orders
      newOrders: "New Orders",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",

      // People
      teamMembers: "Team Members",
      couriers: "Couriers",

      // Not implemented
      notImplemented: "Not Implemented Yet",
      comingSoon: "Coming Soon",
      underConstruction: "This page is under construction",

      //about us
      aboutUsTitle: "From Nature's Hug <br/> to Your Skin",
      aboutUsDescription: "Therapeutic Care, <span>Touched by Nature 🌿</span>",

      // cart
      addedtoCart: '{{product}} added to cart'

    }
  },
  ar: {
    translation: {
      // Pagination
      prev: "السابق",
      next: "التالي",
      // Filters / Product list
      filters: "الفلاتر",
      category: "الفئة",
      all: "الكل",
      sortBy: "الترتيب حسب",
      nameAsc: "الاسم (أ → ي)",
      nameDesc: "الاسم (ي → أ)",
      priceAsc: "السعر (من الأقل إلى الأعلى)",
      priceDesc: "السعر (من الأعلى إلى الأقل)",
      ratingDesc: "الأعلى تقييماً",
      inStockOnly: "المتوفرة فقط",
      onSaleOnly: "المخفضة فقط",

      // Quantity controls
      decreaseQuantity: "إنقاص الكمية",
      increaseQuantity: "زيادة الكمية",

      // Reviews
      noReviews: "لا توجد تقييمات بعد",
      reviews: "التقييمات",
      // Product detail screen
      productNotFound: "المنتج غير موجود.",
      fullDescription: "الوصف الكامل",
      materialsIngredients: "المواد / المكونات",
      noMaterialsListed: "لا توجد مواد مدرجة.",
      bestFor: "مناسب ل",
      precautions: "الاحتياطات",
      na: "غير متوفر",
      // reviews: "التقييمات",
      // Currency
      EGP: "ج.م",

      // Stock / availability
      only: "فقط",
      leftInStock: "متبقي في المخزون",
      inStock: "متوفر",
      maxAvailable: "الحد الأقصى المتاح",

      // Buy / Checkout actions
      BuyNow: "اشتري الآن",

      // Reviews / Add review
      reviewAddedSuccessfully: "تم إضافة التقييم بنجاح",
      addYourReview: "أضف تقييمك",
      yourRating: "تقييمك",
      yourComment: "تعليقك",
      writeYourReviewHere: "اكتب تقييمك هنا",
      submitting: "جاري الإرسال...",
      submitReview: "إرسال التقييم",
      loginToReview: "سجّل الدخول لترك تقييم",
      loginNow: "سجّل الدخول الآن",

      // Confirmations
      confirmDeleteProduct: "هل أنت متأكد أنك تريد حذف هذا المنتج؟",
      // Navbar / auth
      orderHistory: "سجل الطلبات",
      login: "تسجيل الدخول",
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
          description: "منتجات مختارة <b>بعناية للجودة والأناقة</b>.",
        },
        {
          icon: Rocket,
          title: "توصيل سريع",
          description: "يتم شحن طلبك خلال <b>24 ساعة</b>.",
        },
        {
          icon: Box,
          title: "تغليف آمن",
          description: "يتم تغليف المنتجات <b>بشكل آمن ومحمي</b>.",
        },
        {
          icon: Zap,
          title: "عروض حصرية",
          description: "الوصول إلى <b>عروض وتخفيضات خاصة</b>.",
        },
      ],
      dashboard: "لوحة التحكم",
      customers: "العملاء",
      materials: "المواد",
      products: "المنتجات",
      orders: "الطلبات",
      analytics: "التحليلات",
      people: "الأشخاص",
      finance: "المالية",
      reports: "التقارير",
      settings: "الإعدادات",
      profile: "الملف الشخصي",
      logout: "تسجيل الخروج",
      backToSite: "العودة للموقع",
      welcomeBack: "مرحباً بعودتك",
      adminPanel: "لوحة الإدارة",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      create: "إنشاء",
      search: "بحث",
      status: "الحالة",
      actions: "الإجراءات",

      // Materials
      inventory: "المخزون",
      suppliers: "الموردين",
      production: "الإنتاج",
      bom: "قائمة المواد",
      costing: "التكاليف",
      movements: "الحركات",

      // Orders
      newOrders: "طلبات جديدة",
      processing: "قيد المعالجة",
      shipped: "تم الشحن",
      delivered: "تم التوصيل",
      cancelled: "ملغي",

      // People
      teamMembers: "أعضاء الفريق",
      couriers: "المندوبين",

      // Not implemented
      notImplemented: "غير متوفر حالياً",
      comingSoon: "قريباً",
      underConstruction: "هذه الصفحة قيد الإنشاء",

      //about us
      aboutUsTitle: "من حضن الطبيعة  <br/> إلى بشرتك",
      aboutUsDescription: "رعاية علاجية، <span>ملامسة من الطبيعة 🌿</span>",

      // cart
      addedtoCart: 'تم إضافة {{product}} إلى العربة'

    }
  }
};
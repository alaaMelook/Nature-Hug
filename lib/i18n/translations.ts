import { Heart, Rocket, Box, Zap, CheckCircle, Flower, Leaf, Smile, Sparkles } from "lucide-react";

export const resources = {
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
      or: "or",

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
      noBestFor: "No best for listed.",
      noPrecautions: "No precautions listed.",
      na: "N/A",
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
      allProducts: "All Products",
      categories: "Categories",
      allOrders: "All Orders",
      shipping: "Shipping",

      // Dashboard
      totalCustomers: "Total Customers",
      totalProducts: "Total Products",
      totalOrders: "Total Orders",
      totalRevenue: "Total Revenue",
      currentMonth: "Current Month",
      dashboardOverview: "Overview of your store's performance.",
      recentOrders: "Recent Orders",
      viewAllOrders: "View All Orders",
      orderId: "Order ID",
      customer: "Customer",
      total: "Total",
      date: "Date",
      noRecentOrders: "No recent orders found.",
      viewDetails: "View Details",

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
      aboutUsTitle: "من حضن الطبيعة  <br/> إلى بشرتك",
      aboutUsDescription: "رعاية علاجية، <span>ملامسة من الطبيعة 🌿</span>",

      // aliases to match camelCase keys used in components (Arabic)
      ourStory: "قصتنا",
      ourVision: "رؤيتنا",
      corevalues: "القيم الأساسية",
      ourGoals: "أهدافنا",

      // cart
      addedtoCart: 'تم إضافة {{product}} إلى العربة',

      // Contact page
      contactFaqTitle: "الأسئلة المتكررة",
      contactFaqIntro: "اعثر على إجابات سريعة للأسئلة الشائعة حول منتجاتنا وطلباتك وخدماتنا.",
      faq1Title: "ما الذي يميّز منتجات Nature Hug؟",
      faq1Content: "منتجاتنا مصنوعة من مكونات طبيعية وعضوية 100٪، مصدرها أخلاقي وخالية من المواد الكيميائية الضارة. نؤمن بقوة الطبيعة في دعم صحة بشرتك.",
      faq2Title: "هل منتجاتكم مناسبة لكل أنواع البشرة؟",
      faq2Content: "نعم، نقدم مجموعة متنوعة من المنتجات التي تناسب أنواع البشرة المختلفة، بما في ذلك الحساسة والدهنية والجافة والمختلطة. يحتوي وصف كل منتج على معلومات تفصيلية لمساعدتك على الاختيار.",
      faq3Title: "كيف يمكنني تتبع طلبى؟",
      faq3Content: "بمجرد شحن طلبك، ستتلقى رسالة بريد إلكتروني تحتوي على رقم تتبع ورابط لمتابعة حالة التسليم. يمكنك أيضًا تسجيل الدخول إلى حسابك على موقعنا لمراجعة محفوظات الطلبات ومعلومات التتبع.",
      faq4Title: "ما هي سياسة الاسترجاع لديكم؟",
      faq4Content: "نقدم ضمان رضا لمدة 30 يومًا. إذا لم تكن راضيًا تمامًا عن مشترياتك، يمكنك إرجاعها خلال 30 يومًا لاسترداد كامل المبلغ أو استبدالها. راجع صفحة 'الاسترجاع والاسترداد' لمزيد من التعليمات.",
      faq6Title: "هل يمكنني تعديل أو إلغاء طلبي بعد إرساله؟",
      faq6Content: "نعالج الطلبات بسرعة لضمان التسليم الفوري. إذا احتجت إلى تعديل أو إلغاء طلب، يرجى الاتصال بخدمة العملاء في أقرب وقت ممكن. سنبذل قصارى جهدنا للمساعدة، لكن قد لا يكون التغيير ممكنًا إذا تم شحن الطلب بالفعل.",

      contactHeader: "هل لديك استفسارات أخرى؟ يسعدنا سماعك!",
      contactIntro: "رحلتك معنا لا تنتهي عند الطلب... نحن دائمًا هنا للاستماع ومساعدتك والعناية بجمالك الحقيقي 🌿",

      contactMethodSupport: "اتصل بالدعم فورًا",
      contactMethodReply: "سوف نرد خلال 24 ساعة",
      contactMethodFollow: "تابعنا لأحدث العروض",
      contactMethodShare: "شاركنا رأيك",

      // login
      emailRequired: "البريد الإلكتروني مطلوب",
      enterValidEmail: "أدخل بريد إلكتروني صالح",
      passwordRequired: "كلمة المرور مطلوبة",
      passwordMinLength: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      loggingIn: "جارٍ تسجيل الدخول...",
      signup: "إنشاء حساب",
      continueWithGoogle: "المتابعة عبر جوجل",
      unexpectedError: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",

      // sign up
      fullnameRequired: "الاسم الكامل مطلوب",
      enterValidFullName: "أدخل اسمًا كاملاً صالحًا",
      phoneRequired: "رقم الهاتف مطلوب",
      enterValidPhone: "أدخل رقم هاتف صالح",
      signingUp: "جارٍ إنشاء الحساب...",
      fullname: "الاسم الكامل",
      phone: "رقم الهاتف",
      password: "كلمة المرور",
      confirmPassword: "تأكيد كلمة المرور",
      passwordsMustMatch: "يجب أن تتطابق كلمتا المرور",
      email: "البريد الإلكتروني",
      alreadyHaveAccount: "هل لديك حساب؟ سجّل الدخول هنا.",
      failedToSubmit: "فشل في الإرسال. يرجى المحاولة مرة أخرى.",

      // about us content (Arabic)
      goals: [
        'تطوير منتجات آمنة وعالية التأثير بمكونات طبيعية قوية.',
        'تعزيز ثقة النساء بأنفسهن من خلال نتائج مرئية وأصيلة.',
        'بناء تجربة علامة تجارية شفافة وعاطفية.',
        'إلهام النساء لاحتضان ملامحهن الطبيعية والتغلب على الصور النمطية.',
        'الحفاظ على أعلى معايير الجودة والابتكار المستمر.',
      ],
      egyptianBrand: " علامة تجارية <strong>مصرية</strong> تأسست على يد <strong>صيدلانية</strong>. نحن نمزج بين الفعالية الطبية واللطف الطبيعي لاستعادة ثقة البشرة.",
      keracalm: "<strong>نقدم لكم كريم كيراكالم:</strong> <br/> أول <b>كريم يوريا 40٪ آمن في مصر</b> — يعالج المشكلات المستعصية ويقدم نتائج مرئية من الاستخدام الأول. 💖",
      foundation: "أساسنا مبني على الرعاية والشفافية وحب الجمال الطبيعي.<br/> كل منتج يعكس إيماننا بالقوة اللطيفة والنتائج الأصيلة.",
      vision: "أن نكون الخيار الأول للعناية بالبشرة للنساء العربيات، معيدين تعريف العناية بالجمال كعلاج نفسي وعاطفي، وليس مجرد روتين.",
      cores: [
        { icon: 'Leaf', color: 'green', text: 'الطبيعة كمصدر إلهام' },
        { icon: 'Sparkles', color: 'yellow', text: 'التميز في النتائج' },
        { icon: 'Smile', color: 'orange', text: 'التمكين والثقة' },
        { icon: 'Heart', color: 'pink', text: 'رعاية حقيقية من اللمسة' },
        { icon: 'CheckCircle', color: 'green', text: 'الشفافية في الصيغ' },
      ],
      // Admin Product Creation
      productCreated: "تم إنشاء المنتج بنجاح",
      errorCreatingProduct: "خطأ في إنشاء المنتج",
      imageUploaded: "تم رفع الصورة بنجاح",
      errorUploadingImage: "خطأ في رفع الصورة",
      createProduct: "إنشاء منتج",
      nameEn: "الاسم (إنجليزي)",
      nameAr: "الاسم (عربي)",
      price: "السعر",
      stock: "المخزون",
      slug: "الرابط (Slug)",
      descriptionEn: "الوصف (إنجليزي)",
      descriptionAr: "الوصف (عربي)",
      images: "الصور",
      variants: "الخيارات",
      variantNameEn: "اسم الخيار (إنجليزي)",
      removeVariant: "إزالة الخيار",
      addVariant: "إضافة خيار",
      selectFromGallery: "اختر من المعرض",
      uploadNewImage: "رفع صورة جديدة",
      gallery: "المعرض",
      selectImage: "اختر صورة",
      cancelSelection: "إلغاء الاختيار",
      variantNameAr: "اسم الخيار (عربي)",
      basicInformation: "المعلومات الأساسية",
      saveProduct: "حفظ المنتج",
      addMaterial: "إضافة مادة",
      add: "إضافة",
      variantDescriptionOverride: "تجاوز وصف الخيار",
      youMightAlsoLike: "منتجات أخرى قد تعجبك",
    }
  }
};
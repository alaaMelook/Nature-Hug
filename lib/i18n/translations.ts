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

      // aliases to match camelCase keys used in components
      ourStory: "Our Story",
      ourVision: "Our Vision",
      corevalues: "Core Values", // Fixed casing for consistency
      ourGoals: "Our Goals",

      // cart
      addedtoCart: '{{product}} added to cart',

      // Contact page
      contactFaqTitle: "Frequently Asked Questions",
      contactFaqIntro: "Find quick answers to common questions about our products, orders, and services.",
      faq1Title: "What makes Nature Hug products unique?",
      faq1Content: "Our products are crafted with 100% natural and organic ingredients, ethically sourced, and free from harmful chemicals. We believe in harnessing nature's power for your skin's well-being.",
      faq2Title: "Are your products suitable for all skin types?",
      faq2Content: "Yes, we offer a diverse range of products designed to cater to various skin types, including sensitive, oily, dry, and combination skin. Each product description provides detailed information to help you choose the best fit.",
      faq3Title: "How can I track my order?",
      faq3Content: "Once your order is shipped, you will receive an email with a tracking number and a link to monitor its delivery status. You can also log in to your account on our website to view your order history and tracking information.",
      faq4Title: "What is your return policy?",
      faq4Content: "We offer a 30-day satisfaction guarantee. If you are not completely happy with your purchase, you can return it within 30 days for a full refund or exchange. Please refer to our 'Returns & Refunds' page for detailed instructions.",
      faq6Title: "Can I change or cancel my order after it's been placed?",
      faq6Content: "We process orders quickly to ensure prompt delivery. If you need to change or cancel your order, please contact our customer service team as soon as possible. We'll do our best to accommodate your request, but changes may not be possible if the order has already been shipped.",

      contactHeader: "Have other concerns? We'd love to hear from you!",
      contactIntro: "Your journey with us doesn't end with your order... We're always here to listen to you, help you, and care for your true beauty 🌿",

      contactMethodSupport: "Contact support immediately",
      contactMethodReply: "We will reply within 24 hours",
      contactMethodFollow: "Follow us for latest offers",
      contactMethodShare: "Share your opinion with us",

      // login
      emailRequired: "Email is required",
      enterValidEmail: "Enter a valid email",
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 6 characters",
      loggingIn: "Logging in...",
      signup: "Sign Up",
      continueWithGoogle: "Continue with Google",
      unexpectedError: "An unexpected error occurred. Please try again.",

      // sign up
      fullnameRequired: "Full name is required",
      enterValidFullName: "Enter a valid full name",
      phoneRequired: "Phone number is required",
      enterValidPhone: "Enter a valid phone number",
      signingUp: "Signing up...",
      fullname: "Full Name",
      phone: "Phone Number",
      password: "Password",
      confirmPassword: "Confirm Password",
      passwordsMustMatch: "Passwords must match",
      email: "Email",
      alreadyHaveAccount: "Already have an account? Login here.",
      failedToSubmit: "Failed to submit. Please try again.",

      // about us content
      goals: [
        'Develop safe, high-impact products with powerful natural ingredients.',
        'Strengthen women’s self-confidence through visible, authentic results.',
        'Build a transparent and emotionally rich brand experience.',
        'Inspire women to embrace their natural features and rise above stereotypes.',
        'Maintain the highest quality standards and continuously innovate.',
      ],
      egyptianBrand: " An <strong>Egyptian brand</strong> founded by a <strong>pharmacist</strong>. We blend medical- grade effectiveness with the gentleness of nature to restore skin confidence.",
      keracalm: "<strong>Introducing the Keracalm Cream:</strong> <br/> The <b>first safe 40% urea cream in Egypt</b> — treats stubborn issues and delivers visible results from the first use. 💖",
      foundation: "Our foundation is built on care, transparency, and a love for natural beauty.<br/> Every product reflects our belief in gentle strength and authentic results.",
      vision: "To be the #1 skincare choice for Arab women, redefining beauty care as a <strong> psychological and emotional therapy </strong>, not just a routine.",
      cores: [
        { icon: 'Leaf', color: 'green', text: 'Nature as inspiration' },
        { icon: 'Sparkles', color: 'yellow', text: 'Excellence in results' },
        { icon: 'Smile', color: 'orange', text: 'Empowerment and confidence' },
        { icon: 'Heart', color: 'pink', text: 'Genuine care from the touch' },
        { icon: 'CheckCircle', color: 'green', text: 'Transparency in formulas' },
      ],
      // Admin Product Creation
      productCreated: "Product created successfully",
      errorCreatingProduct: "Error creating product",
      imageUploaded: "Image uploaded successfully",
      errorUploadingImage: "Error uploading image",
      createProduct: "Create product",
      nameEn: "Name (English)",
      nameAr: "Name (Arabic)",
      price: "Price",
      stock: "Stock",
      slug: "Slug",
      descriptionEn: "Description (English)",
      descriptionAr: "Description (Arabic)",
      images: "Images",
      variants: "Variants",
      variantNameEn: "Variant Name (English)",
      removeVariant: "Remove Variant",
      addVariant: "Add Variant",
      selectFromGallery: "Select from Gallery",
      uploadNewImage: "Upload New Image",
      gallery: "Gallery",
      selectImage: "Select Image",
      cancelSelection: "Cancel Selection",
      variantNameAr: "Variant Name (Arabic)",
      basicInformation: "Basic Information",
      saveProduct: "Save Product",
      addMaterial: "Add Material",
      add: "Add",
      variantDescriptionOverride: "Variant Description Override",
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
      or: "أو",

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
      shopNow: "تسوق الآن",
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
    }
  }
};
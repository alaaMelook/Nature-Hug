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
      history: "History",
      shipmentHistory: "Shipment History",
      fromDate: "From Date",
      toDate: "To Date",
      awb: "AWB",
      amount: "Amount",
      noShipmentsFound: "No shipments found",
      failedToFetchHistory: "Failed to fetch shipment history",
      errorOccurred: "An error occurred",

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

      // Checkout
      checkout: {
        title: "Checkout",
        subtitleGuest: "Complete your order details below",
        subtitleUser: "Welcome back, <1>{{name}}</1>",
        alreadyHaveAccount: "Already have an account?",
        login: "Login",
        contactInfo: "Contact Information",
        fullName: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        altPhone: "Alternative Phone",
        optional: "(Optional)",
        shippingAddress: "Shipping Address",
        streetAddress: "Street Address",
        governorate: "Governorate",
        selectGovernorate: "Select Governorate",
        addNewAddress: "Add New Address",
        paymentMethod: "Payment Method",
        cod: "Cash on Delivery",
        codDesc: "Pay when you receive your order",
        online: "Online Payment",
        onlineDesc: "Credit Card / Mobile Wallet",
        terms: "I have read and agree to the <1>Terms and Conditions</1>.",
        processing: "Processing your Order...",
        errors: {
          selectGovernorate: "Please select a governorate.",
          acceptTerms: "You must accept the Terms and Conditions.",
          required: "{{field}} is required",
          invalid: "Enter a valid {{field}}",
        },
        // Cart Summary
        backToCart: "Back to Cart",
        orderSummary: "Order Summary",
        cartEmpty: "Your cart is empty.",
        promoCodePlaceholder: "Promo Code",
        apply: "Apply",
        subtotal: "Subtotal",
        shipping: "Shipping",
        selectLocation: "Select Location",
        discount: "Discount",
        total: "Total",
        includingVat: "Including VAT",
        completeOrder: "Complete Order",
        payNowButton: "Complete Order",
        applyButton: "Apply",
      },

      // Orders
      ordersScreen: {
        title: "My Orders",
        showing: "Showing {{count}} of {{total}} recent orders",
        noOrders: "You have no orders yet.",
        orderNumber: "Order #{{id}}",
        placed: "Placed {{date}}",
        itemsCount: "{{count}} items",
        viewDetails: "View details",
        showMore: "Show more",
        showLess: "Show less",
        notFound: "Oh no! We couldn't find the details for this order.",
        thankYou: "Thank you — your order is confirmed!",
        preparing: "We've received your order and are preparing it for shipment.",
        signupPrompt: "You can always come back later to this page easily, if you <1>signed up here</1>",
        placedOn: "Placed on {{date}}",
        items: "Items",
        qty: "Qty:",
        summary: "Summary",
        subtotal: "Subtotal",
        discount: "Discount",
        shipping: "Shipping",
        tax: "Tax",
        total: "Total",
        promoApplied: "Promo <b>{{code}}</b> applied ({{percent}}% off)",
        orderAgain: "Order Again",
        paymentStatus: "Payment status",
        payNow: "pay now!",
        grandTotal: "Grand total",
        orderNotFoundTitle: "Order not found",
        orderNotFoundDesc: "We couldn't find the order details. This may be because the order ID is invalid or the order hasn't been processed yet.",
        viewMyOrders: "View my orders",
        contactSupport: "Contact support",
      },

      // Profile
      profileScreen: {
        title: "My Profile",
        name: "Name",
        email: "Email",
        phone: "Phone {{index}}",
        newPhone: "New Phone",
        addPhone: "Add Phone",
        addresses: "Addresses",
        noAddresses: "No addresses yet.",
        newAddress: "New Address",
        addNewAddress: "Add a new address",
        confirmDelete: "Are you sure you want to delete this {{type}}?",
        addressDeleted: "Address deleted successfully",
        addressUpdated: "Address updated successfully",
      },

      // Verify
      verify: {
        title: "Verify your email address",
        message: "You’ve entered <1>{{email}}</1> as the email address for your account.",
        instruction: "Just click on the link in that email to complete your signup. If you don't see it, you may need to check your spam folder."
      }
    }
  },
  ar: {
    translation: {
      // Pagination
      prev: "السابق",
      next: "التالي",
      // Filters / Product list
      filters: "تصفية",
      category: "الفئة",
      all: "الكل",
      sortBy: "ترتيب حسب",
      nameAsc: "الاسم (أ ← ي)",
      nameDesc: "الاسم (ي ← أ)",
      priceAsc: "السعر (الأقل ← الأعلى)",
      priceDesc: "السعر (الأعلى ← الأقل)",
      ratingDesc: "الأعلى تقييماً",
      inStockOnly: "المتوفر فقط",
      onSaleOnly: "العروض فقط",
      or: "أو",

      // Quantity controls
      decreaseQuantity: "إنقاص الكمية",
      increaseQuantity: "زيادة الكمية",

      // Reviews
      noReviews: "لا توجد مراجعات بعد",
      reviews: "المراجعات",
      // Product detail screen
      productNotFound: "المنتج غير موجود.",
      fullDescription: "الوصف الكامل",
      materialsIngredients: "المواد / المكونات",
      noMaterialsListed: "لا توجد مواد مدرجة.",
      bestFor: "الأفضل لـ",
      precautions: "احتياطات",
      noBestFor: "لم يتم تحديد الأفضل لـ.",
      noPrecautions: "لا توجد احتياطات مدرجة.",
      na: "غير متوفر",
      // Currency
      EGP: "ج.م",

      // Stock / availability
      only: "فقط",
      leftInStock: "متبقي في المخزون",
      inStock: "متوفر",
      maxAvailable: "الحد الأقصى المتاح",

      // Buy / Checkout actions
      BuyNow: "اشترِ الآن",

      // Reviews / Add review
      reviewAddedSuccessfully: "تم إضافة المراجعة بنجاح",
      addYourReview: "أضف مراجعتك",
      yourRating: "تقييمك",
      yourComment: "تعليقك",
      writeYourReviewHere: "اكتب مراجعتك هنا",
      submitting: "جارٍ الإرسال...",
      submitReview: "إرسال المراجعة",
      loginToReview: "سجل الدخول للمراجعة",
      loginNow: "سجل الدخول الآن",

      // Confirmations
      confirmDeleteProduct: "هل أنت متأكد أنك تريد حذف هذا المنتج؟",
      // Navbar / auth
      orderHistory: "سجل الطلبات",
      login: "تسجيل الدخول",
      home: "الرئيسية",
      shop: "المتجر",
      about: "عنّا",
      contact: "اتصل بنا",
      cart: "العربة",
      emptyCart: "عربتك فارغة!",
      startAdding: "ابدأ بإضافة منتجات إلى عربتك لرؤيتها هنا.",
      shopNow: "تسوق الآن",
      quantity: "الكمية",
      each: "للقطعة",
      subtotal: "المجموع الفرعي",
      checkoutInfo: "يتم حساب الضرائب والشحن عند إتمام الطلب.",
      proceedToCheckout: "متابعة الشراء",
      loadingCart: "جارٍ تحميل عربتك...",
      remove: "إزالة العنصر",
      backToShop: "العودة للمتجر",
      error: "خطأ في تحميل المنتجات",
      noProd: "لا توجد منتجات متاحة",
      noImg: "لا توجد صورة",
      outOfStock: "نفد المخزون",
      addToCart: "أضف للعربة",
      featuredProducts: "منتجات مميزة",
      learnMore: "اعرف المزيد",
      allRightsReserved: "جميع الحقوق محفوظة.",
      heroTitle: "حيث كل مكون هو وعد.",
      heroDescription: "عناق لطيف لبشرتك من الطبيعة نفسها.",
      addedLocal: "تمت الإضافة للعربة المحلية (سجل الدخول للمزامنة).",
      addedServer: "تمت إضافة المنتج للعربة!",

      // Common
      dashboard: "لوحة التحكم",
      customers: "العملاء",
      materials: "المواد",
      products: "المنتجات",
      orders: "الطلبات",
      analytics: "التحليلات",
      people: "الأفراد",
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
      actions: "إجراءات",
      allProducts: "كل المنتجات",
      categories: "الفئات",
      allOrders: "كل الطلبات",
      shipping: "الشحن",

      // Dashboard
      totalCustomers: "إجمالي العملاء",
      totalProducts: "إجمالي المنتجات",
      totalOrders: "إجمالي الطلبات",
      totalRevenue: "إجمالي الإيرادات",
      currentMonth: "الشهر الحالي",
      dashboardOverview: "نظرة عامة على أداء متجرك.",
      recentOrders: "الطلبات الأخيرة",
      viewAllOrders: "عرض كل الطلبات",
      orderId: "رقم الطلب",
      customer: "العميل",
      total: "الإجمالي",
      date: "التاريخ",
      noRecentOrders: "لا توجد طلبات حديثة.",
      viewDetails: "عرض التفاصيل",

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

      // Checkout
      checkout: {
        title: "إتمام الطلب",
        subtitleGuest: "أكمل تفاصيل طلبك أدناه",
        subtitleUser: "مرحباً بعودتك، <1>{{name}}</1>",
        alreadyHaveAccount: "هل لديك حساب بالفعل؟",
        login: "تسجيل الدخول",
        contactInfo: "معلومات الاتصال",
        fullName: "الاسم الكامل",
        email: "البريد الإلكتروني",
        phone: "رقم الهاتف",
        altPhone: "رقم هاتف بديل",
        optional: "(اختياري)",
        shippingAddress: "عنوان الشحن",
        streetAddress: "اسم الشارع / العنوان",
        governorate: "المحافظة",
        selectGovernorate: "اختر المحافظة",
        addNewAddress: "إضافة عنوان جديد",
        paymentMethod: "طريقة الدفع",
        cod: "الدفع عند الاستلام",
        codDesc: "ادفع عند استلام طلبك",
        online: "دفع إلكتروني",
        onlineDesc: "بطاقة ائتمان / محفظة إلكترونية",
        terms: "لقد قرأت ووافقت على <1>الشروط والأحكام</1>.",
        processing: "جارٍ معالجة طلبك...",
        errors: {
          selectGovernorate: "يرجى اختيار المحافظة.",
          acceptTerms: "يجب الموافقة على الشروط والأحكام.",
          required: "{{field}} مطلوب",
          invalid: "أدخل {{field}} صالح",
        },
        // Cart Summary
        backToCart: "العودة للعربة",
        orderSummary: "ملخص الطلب",
        cartEmpty: "عربتك فارغة.",
        promoCodePlaceholder: "كود الخصم",
        apply: "تطبيق",
        subtotal: "المجموع الفرعي",
        shipping: "الشحن",
        selectLocation: "اختر الموقع",
        discount: "الخصم",
        total: "الإجمالي",
        includingVat: "شامل الضريبة",
        completeOrder: "إتمام الطلب",
        payNowButton: "إتمام الطلب",
        applyButton: "تطبيق",
      },

      // Orders
      ordersScreen: {
        title: "طلباتي",
        showing: "عرض {{count}} من {{total}} طلبات حديثة",
        noOrders: "ليس لديك طلبات بعد.",
        orderNumber: "طلب #{{id}}",
        placed: "تم الطلب {{date}}",
        itemsCount: "{{count}} عناصر",
        viewDetails: "عرض التفاصيل",
        showMore: "عرض المزيد",
        showLess: "عرض أقل",
        notFound: "أوه لا! لم نتمكن من العثور على تفاصيل هذا الطلب.",
        thankYou: "شكراً لك — تم تأكيد طلبك!",
        preparing: "لقد استلمنا طلبك ونقوم بتجهيزه للشحن.",
        signupPrompt: "يمكنك دائماً العودة لاحقاً لهذه الصفحة بسهولة، إذا <1>سجلت هنا</1>",
        placedOn: "تم الطلب في {{date}}",
        items: "العناصر",
        qty: "الكمية:",
        summary: "الملخص",
        subtotal: "المجموع الفرعي",
        discount: "الخصم",
        shipping: "الشحن",
        tax: "الضريبة",
        total: "الإجمالي",
        promoApplied: "تم تطبيق كوبون <b>{{code}}</b> (خصم {{percent}}%)",
        orderAgain: "اطلب مرة أخرى",
        paymentStatus: "حالة الدفع",
        payNow: "ادفع الآن!",
        grandTotal: "المجموع الكلي",
        orderNotFoundTitle: "الطلب غير موجود",
        orderNotFoundDesc: "لم نتمكن من العثور على تفاصيل الطلب. قد يكون رقم الطلب غير صحيح أو لم تتم معالجة الطلب بعد.",
        viewMyOrders: "عرض طلباتي",
        contactSupport: "اتصل بالدعم",
      },

      // Profile
      profileScreen: {
        title: "ملفي الشخصي",
        name: "الاسم",
        email: "البريد الإلكتروني",
        phone: "هاتف {{index}}",
        newPhone: "هاتف جديد",
        addPhone: "إضافة هاتف",
        addresses: "العناوين",
        noAddresses: "لا توجد عناوين بعد.",
        newAddress: "عنوان جديد",
        addNewAddress: "إضافة عنوان جديد",
        confirmDelete: "هل أنت متأكد أنك تريد حذف هذا {{type}}؟",
        addressDeleted: "تم حذف العنوان بنجاح",
        addressUpdated: "تم تحديث العنوان بنجاح",
      },
      // Verify
      verify: {
        title: "تأكيد عنوان البريد الإلكتروني",
        message: "لقد أدخلت <1>{{email}}</1> كعنوان بريد إلكتروني لحسابك.",
        instruction: "فقط انقر على الرابط في ذلك البريد الإلكتروني لإكمال تسجيلك. إذا لم تره، قد تحتاج للتحقق من مجلد الرسائل غير المرغوب فيها."
      }
    }
  }
};
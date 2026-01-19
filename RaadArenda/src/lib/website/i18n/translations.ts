export type Locale = 'ru' | 'uz' | 'en';

export const translations = {
  ru: {
    // Common
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      cancel: 'Отмена',
      save: 'Сохранить',
      delete: 'Удалить',
      edit: 'Редактировать',
      close: 'Закрыть',
      search: 'Поиск',
      all: 'Все',
      perDay: 'в день',
      itemsLeft: 'осталось',
      notAvailable: 'Нет в наличии',
      discount: 'Скидка',
    },

    // Navigation
    nav: {
      home: 'Главная',
      catalog: 'Каталог',
      about: 'О нас',
      contact: 'Контакты',
      cart: 'Корзина',
      favorites: 'Избранное',
      profile: 'Профиль',
      orders: 'Заказы',
      login: 'Войти',
      logout: 'Выйти',
    },

    // Home page
    home: {
      heroTitle: 'Аренда для ваших мероприятий',
      heroSubtitle: 'Мебель, декор, освещение, звук и многое другое для свадеб, корпоративов и праздников в Ташкенте',
      viewCatalog: 'Смотреть каталог',
      whyChooseUs: 'Почему выбирают нас',
      features: {
        quality: {
          title: 'Премиум качество',
          description: 'Тщательно отобранные предметы, которые сделают ваше мероприятие незабываемым',
        },
        delivery: {
          title: 'Быстрая доставка',
          description: 'Доставка и установка по всему Ташкенту в удобное для вас время',
        },
        support: {
          title: 'Поддержка 24/7',
          description: 'Наша команда всегда готова помочь вам с любыми вопросами',
        },
        pricing: {
          title: 'Гибкие цены',
          description: 'Специальные скидки при длительной аренде и больших заказах',
        },
      },
      readyToStart: 'Готовы начать?',
      ctaSubtitle: 'Выберите из сотен предметов для вашего идеального мероприятия',
      browseProducts: 'Посмотреть товары',
    },

    // Catalog page
    catalog: {
      title: 'Каталог',
      searchResults: 'Поиск: "{query}"',
      productsCount: '{count} товаров',
      noResults: 'Ничего не найдено',
      noResultsDescription: 'Измените параметры поиска или выберите другую категорию',
      clearFilters: 'Сбросить фильтры',
      sort: {
        newest: 'Новинки',
        popular: 'По популярности',
        priceAsc: 'Сначала дешевые',
        priceDesc: 'Сначала дорогие',
      },
    },

    // Auth page
    auth: {
      title: 'Вход в аккаунт',
      subtitle: 'Введите номер телефона для входа',
      phonePlaceholder: '90 123 45 67',
      getCode: 'Получить код',
      enterCode: 'Введите код',
      codeSent: 'SMS отправлено на',
      resendCode: 'Отправить код повторно',
      resendIn: 'Повторить через',
      changeNumber: 'Изменить номер',
      termsAgreement: 'Нажимая "Получить код", вы соглашаетесь с',
      termsLink: 'условиями использования',
      welcome: 'Добро пожаловать!',
      invalidPhone: 'Введите правильный номер телефона',
      codeSentSuccess: 'Код отправлен на ваш номер',
      codeError: 'Не удалось отправить код. Попробуйте позже.',
      invalidCode: 'Неверный код. Попробуйте снова.',
    },

    // Favorites
    favorites: {
      addToFavorites: 'Добавить в избранное',
      removeFromFavorites: 'Убрать из избранного',
      addedToFavorites: 'Добавлено в избранное',
      removedFromFavorites: 'Удалено из избранного',
      loginRequired: 'Войдите, чтобы добавить в избранное',
      updateError: 'Не удалось обновить избранное',
    },

    // Footer
    footer: {
      description: 'Ваш надежный партнер по аренде оборудования для мероприятий в Ташкенте',
      quickLinks: 'Быстрые ссылки',
      categories: 'Категории',
      contact: 'Контакты',
      workingHours: 'Часы работы',
      allRightsReserved: 'Все права защищены',
    },

    // Product page
    product: {
      addToCart: 'Добавить в корзину',
      inStock: 'В наличии',
      outOfStock: 'Нет в наличии',
      specifications: 'Характеристики',
      width: 'Ширина',
      height: 'Высота',
      depth: 'Глубина',
      weight: 'Вес',
      color: 'Цвет',
      material: 'Материал',
      selectDates: 'Выберите даты',
      startDate: 'Дата начала',
      endDate: 'Дата окончания',
      quantity: 'Количество',
      days: 'дней',
      day: 'день',
      totalPrice: 'Итого',
      pricePerDay: 'Цена за день',
      youSave: 'Вы экономите',
      pricingTiers: 'Скидки за длительность',
      quantityDiscounts: 'Скидки за количество',
      daysOrMore: 'дней и более',
      unitsOrMore: 'шт. и более',
      addedToCart: 'Товар добавлен в корзину',
      selectDatesFirst: 'Сначала выберите даты аренды',
      notEnoughStock: 'Недостаточно товара на складе',
      goToCart: 'Перейти в корзину',
      continueShopping: 'Продолжить покупки',
      pcs: 'шт.',
      cm: 'см',
      kg: 'кг',
    },

    // Cart page
    cart: {
      title: 'Корзина',
      empty: 'Корзина пуста',
      emptyDescription: 'Добавьте товары из каталога',
      goToCatalog: 'Перейти в каталог',
      remove: 'Удалить',
      subtotal: 'Подытог',
      delivery: 'Доставка',
      free: 'Бесплатно',
      total: 'Итого',
      savings: 'Экономия',
      checkout: 'Оформить заказ',
      clearCart: 'Очистить корзину',
      rentalPeriod: 'Период аренды',
      items: 'товаров',
      item: 'товар',
    },

    // Profile page
    profile: {
      title: 'Профиль',
      personalInfo: 'Личная информация',
      name: 'Имя',
      phone: 'Телефон',
      editProfile: 'Редактировать профиль',
      addresses: 'Адреса',
      addAddress: 'Добавить адрес',
      noAddresses: 'Нет сохраненных адресов',
      defaultAddress: 'Основной адрес',
      setAsDefault: 'Сделать основным',
      deleteAddress: 'Удалить адрес',
      saveName: 'Сохранить',
      nameUpdated: 'Имя обновлено',
      updateError: 'Ошибка при обновлении',
    },

    // Orders page
    orders: {
      title: 'Мои заказы',
      empty: 'У вас пока нет заказов',
      emptyDescription: 'Оформите первый заказ из каталога',
      orderNumber: 'Заказ №',
      status: {
        CONFIRMED: 'Подтвержден',
        PREPARING: 'Готовится',
        DELIVERED: 'Доставлен',
        RETURNED: 'Возвращен',
        CANCELLED: 'Отменен',
      },
      deliveryType: {
        DELIVERY: 'Доставка',
        SELF_PICKUP: 'Самовывоз',
      },
      viewDetails: 'Подробнее',
      orderDate: 'Дата заказа',
      rentalPeriod: 'Период аренды',
      totalAmount: 'Сумма заказа',
    },

    // Favorites page
    favoritesPage: {
      title: 'Избранное',
      empty: 'Список избранного пуст',
      emptyDescription: 'Добавляйте понравившиеся товары, нажимая на сердечко',
    },

    // Checkout page
    checkout: {
      title: 'Оформление заказа',
      deliveryMethod: 'Способ получения',
      delivery: 'Доставка',
      selfPickup: 'Самовывоз',
      deliveryAddress: 'Адрес доставки',
      selectAddress: 'Выберите адрес',
      addNewAddress: 'Добавить новый адрес',
      pickupAddress: 'Адрес самовывоза',
      paymentMethod: 'Способ оплаты',
      orderNotes: 'Комментарий к заказу',
      notesPlaceholder: 'Дополнительная информация о заказе...',
      orderSummary: 'Ваш заказ',
      placeOrder: 'Оформить заказ',
      processing: 'Оформление...',
      orderSuccess: 'Заказ успешно оформлен!',
      orderSuccessDescription: 'Мы свяжемся с вами для подтверждения',
      orderError: 'Ошибка при оформлении заказа',
      emptyCart: 'Корзина пуста',
      goToOrders: 'Мои заказы',
    },
  },

  uz: {
    // Common
    common: {
      loading: 'Yuklanmoqda...',
      error: 'Xato',
      success: 'Muvaffaqiyatli',
      cancel: 'Bekor qilish',
      save: 'Saqlash',
      delete: "O'chirish",
      edit: 'Tahrirlash',
      close: 'Yopish',
      search: 'Qidirish',
      all: 'Hammasi',
      perDay: 'kuniga',
      itemsLeft: 'ta qoldi',
      notAvailable: 'Mavjud emas',
      discount: 'Chegirma',
    },

    // Navigation
    nav: {
      home: 'Bosh sahifa',
      catalog: 'Katalog',
      about: 'Biz haqimizda',
      contact: 'Aloqa',
      cart: 'Savat',
      favorites: 'Sevimlilar',
      profile: 'Profil',
      orders: 'Buyurtmalar',
      login: 'Kirish',
      logout: 'Chiqish',
    },

    // Home page
    home: {
      heroTitle: 'Tadbirlaringiz uchun ijara',
      heroSubtitle: "Toshkentda to'ylar, korporativlar va bayramlar uchun mebel, dekor, yoritish, ovoz va boshqalar",
      viewCatalog: 'Katalogni ko\'rish',
      whyChooseUs: 'Nega bizni tanlashadi',
      features: {
        quality: {
          title: 'Premium sifat',
          description: "Tadbiringizni unutilmas qiladigan ehtiyotkorlik bilan tanlangan mahsulotlar",
        },
        delivery: {
          title: 'Tez yetkazib berish',
          description: "Toshkent bo'ylab qulay vaqtda yetkazib berish va o'rnatish",
        },
        support: {
          title: '24/7 qo\'llab-quvvatlash',
          description: "Jamoamiz har qanday savollaringizga yordam berishga doim tayyor",
        },
        pricing: {
          title: 'Moslashuvchan narxlar',
          description: "Uzoq muddatli ijara va katta buyurtmalar uchun maxsus chegirmalar",
        },
      },
      readyToStart: 'Boshlashga tayyormisiz?',
      ctaSubtitle: "Mukammal tadbiringiz uchun yuzlab mahsulotlardan tanlang",
      browseProducts: "Mahsulotlarni ko'rish",
    },

    // Catalog page
    catalog: {
      title: 'Katalog',
      searchResults: 'Qidiruv: "{query}"',
      productsCount: '{count} ta mahsulot',
      noResults: 'Hech narsa topilmadi',
      noResultsDescription: "Qidiruv parametrlarini o'zgartiring yoki boshqa kategoriyani tanlang",
      clearFilters: 'Filtrlarni tozalash',
      sort: {
        newest: 'Eng yangilar',
        popular: "Mashhurlik bo'yicha",
        priceAsc: 'Arzon',
        priceDesc: 'Qimmat',
      },
    },

    // Auth page
    auth: {
      title: 'Hisobga kirish',
      subtitle: 'Kirish uchun telefon raqamingizni kiriting',
      phonePlaceholder: '90 123 45 67',
      getCode: 'Kodni olish',
      enterCode: 'Kodni kiriting',
      codeSent: 'SMS yuborildi',
      resendCode: 'Kodni qayta yuborish',
      resendIn: 'Qayta yuborish',
      changeNumber: "Raqamni o'zgartirish",
      termsAgreement: '"Kodni olish" tugmasini bosish orqali siz',
      termsLink: 'foydalanish shartlari',
      welcome: 'Xush kelibsiz!',
      invalidPhone: "To'g'ri telefon raqamini kiriting",
      codeSentSuccess: 'Kod raqamingizga yuborildi',
      codeError: "Kod yuborib bo'lmadi. Keyinroq urinib ko'ring.",
      invalidCode: "Noto'g'ri kod. Qaytadan urinib ko'ring.",
    },

    // Favorites
    favorites: {
      addToFavorites: "Sevimlilarga qo'shish",
      removeFromFavorites: "Sevimlilardan o'chirish",
      addedToFavorites: "Sevimlilarga qo'shildi",
      removedFromFavorites: "Sevimlilardan o'chirildi",
      loginRequired: "Sevimliga qo'shish uchun hisobingizga kiring",
      updateError: "Sevimlilarni yangilab bo'lmadi",
    },

    // Footer
    footer: {
      description: "Toshkentda tadbirlar uchun jihozlar ijarasida ishonchli hamkoringiz",
      quickLinks: 'Tezkor havolalar',
      categories: 'Kategoriyalar',
      contact: 'Aloqa',
      workingHours: 'Ish vaqti',
      allRightsReserved: 'Barcha huquqlar himoyalangan',
    },

    // Product page
    product: {
      addToCart: "Savatga qo'shish",
      inStock: 'Mavjud',
      outOfStock: 'Mavjud emas',
      specifications: 'Xususiyatlar',
      width: 'Kengligi',
      height: 'Balandligi',
      depth: 'Chuqurligi',
      weight: "Og'irligi",
      color: 'Rangi',
      material: 'Materiali',
      selectDates: 'Sanalarni tanlang',
      startDate: 'Boshlanish sanasi',
      endDate: 'Tugash sanasi',
      quantity: 'Miqdori',
      days: 'kun',
      day: 'kun',
      totalPrice: 'Jami',
      pricePerDay: 'Kunlik narxi',
      youSave: 'Tejaysiz',
      pricingTiers: 'Davomiylik bo\'yicha chegirmalar',
      quantityDiscounts: 'Miqdor bo\'yicha chegirmalar',
      daysOrMore: 'kun va undan ko\'p',
      unitsOrMore: 'dona va undan ko\'p',
      addedToCart: 'Mahsulot savatga qo\'shildi',
      selectDatesFirst: 'Avval ijara sanalarini tanlang',
      notEnoughStock: 'Omborda yetarli mahsulot yo\'q',
      goToCart: 'Savatga o\'tish',
      continueShopping: 'Xaridni davom ettirish',
      pcs: 'dona',
      cm: 'sm',
      kg: 'kg',
    },

    // Cart page
    cart: {
      title: 'Savat',
      empty: 'Savat bo\'sh',
      emptyDescription: 'Katalogdan mahsulotlar qo\'shing',
      goToCatalog: 'Katalogga o\'tish',
      remove: 'O\'chirish',
      subtotal: 'Oraliq summa',
      delivery: 'Yetkazib berish',
      free: 'Bepul',
      total: 'Jami',
      savings: 'Tejov',
      checkout: 'Buyurtma berish',
      clearCart: 'Savatni tozalash',
      rentalPeriod: 'Ijara davri',
      items: 'ta mahsulot',
      item: 'mahsulot',
    },

    // Profile page
    profile: {
      title: 'Profil',
      personalInfo: 'Shaxsiy ma\'lumotlar',
      name: 'Ism',
      phone: 'Telefon',
      editProfile: 'Profilni tahrirlash',
      addresses: 'Manzillar',
      addAddress: 'Manzil qo\'shish',
      noAddresses: 'Saqlangan manzillar yo\'q',
      defaultAddress: 'Asosiy manzil',
      setAsDefault: 'Asosiy qilish',
      deleteAddress: 'Manzilni o\'chirish',
      saveName: 'Saqlash',
      nameUpdated: 'Ism yangilandi',
      updateError: 'Yangilashda xato',
    },

    // Orders page
    orders: {
      title: 'Mening buyurtmalarim',
      empty: 'Sizda hali buyurtmalar yo\'q',
      emptyDescription: 'Katalogdan birinchi buyurtmangizni bering',
      orderNumber: 'Buyurtma №',
      status: {
        CONFIRMED: 'Tasdiqlangan',
        PREPARING: 'Tayyorlanmoqda',
        DELIVERED: 'Yetkazildi',
        RETURNED: 'Qaytarildi',
        CANCELLED: 'Bekor qilindi',
      },
      deliveryType: {
        DELIVERY: 'Yetkazib berish',
        SELF_PICKUP: 'Olib ketish',
      },
      viewDetails: 'Batafsil',
      orderDate: 'Buyurtma sanasi',
      rentalPeriod: 'Ijara davri',
      totalAmount: 'Buyurtma summasi',
    },

    // Favorites page
    favoritesPage: {
      title: 'Sevimlilar',
      empty: 'Sevimlilar ro\'yxati bo\'sh',
      emptyDescription: 'Yoqtirgan mahsulotlarni yurakchani bosib qo\'shing',
    },

    // Checkout page
    checkout: {
      title: 'Buyurtmani rasmiylashtirish',
      deliveryMethod: 'Olish usuli',
      delivery: 'Yetkazib berish',
      selfPickup: 'Olib ketish',
      deliveryAddress: 'Yetkazib berish manzili',
      selectAddress: 'Manzilni tanlang',
      addNewAddress: 'Yangi manzil qo\'shish',
      pickupAddress: 'Olib ketish manzili',
      paymentMethod: 'To\'lov usuli',
      orderNotes: 'Buyurtmaga izoh',
      notesPlaceholder: 'Buyurtma haqida qo\'shimcha ma\'lumot...',
      orderSummary: 'Sizning buyurtmangiz',
      placeOrder: 'Buyurtma berish',
      processing: 'Rasmiylashtirish...',
      orderSuccess: 'Buyurtma muvaffaqiyatli rasmiylashtirildi!',
      orderSuccessDescription: 'Tasdiqlash uchun siz bilan bog\'lanamiz',
      orderError: 'Buyurtmani rasmiylashtirishda xato',
      emptyCart: 'Savat bo\'sh',
      goToOrders: 'Mening buyurtmalarim',
    },
  },

  en: {
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      search: 'Search',
      all: 'All',
      perDay: 'per day',
      itemsLeft: 'left',
      notAvailable: 'Not available',
      discount: 'Discount',
    },

    // Navigation
    nav: {
      home: 'Home',
      catalog: 'Catalog',
      about: 'About',
      contact: 'Contact',
      cart: 'Cart',
      favorites: 'Favorites',
      profile: 'Profile',
      orders: 'Orders',
      login: 'Login',
      logout: 'Logout',
    },

    // Home page
    home: {
      heroTitle: 'Rentals for Your Events',
      heroSubtitle: 'Furniture, decor, lighting, sound and more for weddings, corporate events and celebrations in Tashkent',
      viewCatalog: 'View Catalog',
      whyChooseUs: 'Why Choose Us',
      features: {
        quality: {
          title: 'Premium Quality',
          description: 'Carefully selected items that will make your event unforgettable',
        },
        delivery: {
          title: 'Fast Delivery',
          description: 'Delivery and setup throughout Tashkent at your convenience',
        },
        support: {
          title: '24/7 Support',
          description: 'Our team is always ready to help you with any questions',
        },
        pricing: {
          title: 'Flexible Pricing',
          description: 'Special discounts for long-term rentals and large orders',
        },
      },
      readyToStart: 'Ready to Get Started?',
      ctaSubtitle: 'Choose from hundreds of items for your perfect event',
      browseProducts: 'Browse Products',
    },

    // Catalog page
    catalog: {
      title: 'Catalog',
      searchResults: 'Search: "{query}"',
      productsCount: '{count} products',
      noResults: 'Nothing found',
      noResultsDescription: 'Change search parameters or select another category',
      clearFilters: 'Clear filters',
      sort: {
        newest: 'Newest',
        popular: 'Most popular',
        priceAsc: 'Price: Low to High',
        priceDesc: 'Price: High to Low',
      },
    },

    // Auth page
    auth: {
      title: 'Sign In',
      subtitle: 'Enter your phone number to sign in',
      phonePlaceholder: '90 123 45 67',
      getCode: 'Get Code',
      enterCode: 'Enter Code',
      codeSent: 'SMS sent to',
      resendCode: 'Resend code',
      resendIn: 'Resend in',
      changeNumber: 'Change number',
      termsAgreement: 'By clicking "Get Code", you agree to our',
      termsLink: 'terms of service',
      welcome: 'Welcome!',
      invalidPhone: 'Enter a valid phone number',
      codeSentSuccess: 'Code sent to your number',
      codeError: 'Failed to send code. Try again later.',
      invalidCode: 'Invalid code. Please try again.',
    },

    // Favorites
    favorites: {
      addToFavorites: 'Add to favorites',
      removeFromFavorites: 'Remove from favorites',
      addedToFavorites: 'Added to favorites',
      removedFromFavorites: 'Removed from favorites',
      loginRequired: 'Sign in to add to favorites',
      updateError: 'Failed to update favorites',
    },

    // Footer
    footer: {
      description: 'Your reliable partner for event equipment rental in Tashkent',
      quickLinks: 'Quick Links',
      categories: 'Categories',
      contact: 'Contact',
      workingHours: 'Working Hours',
      allRightsReserved: 'All rights reserved',
    },

    // Product page
    product: {
      addToCart: 'Add to Cart',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      specifications: 'Specifications',
      width: 'Width',
      height: 'Height',
      depth: 'Depth',
      weight: 'Weight',
      color: 'Color',
      material: 'Material',
      selectDates: 'Select Dates',
      startDate: 'Start Date',
      endDate: 'End Date',
      quantity: 'Quantity',
      days: 'days',
      day: 'day',
      totalPrice: 'Total',
      pricePerDay: 'Price per Day',
      youSave: 'You Save',
      pricingTiers: 'Duration Discounts',
      quantityDiscounts: 'Quantity Discounts',
      daysOrMore: 'days or more',
      unitsOrMore: 'units or more',
      addedToCart: 'Product added to cart',
      selectDatesFirst: 'Please select rental dates first',
      notEnoughStock: 'Not enough stock available',
      goToCart: 'Go to Cart',
      continueShopping: 'Continue Shopping',
      pcs: 'pcs',
      cm: 'cm',
      kg: 'kg',
    },

    // Cart page
    cart: {
      title: 'Cart',
      empty: 'Cart is empty',
      emptyDescription: 'Add products from catalog',
      goToCatalog: 'Go to Catalog',
      remove: 'Remove',
      subtotal: 'Subtotal',
      delivery: 'Delivery',
      free: 'Free',
      total: 'Total',
      savings: 'Savings',
      checkout: 'Checkout',
      clearCart: 'Clear Cart',
      rentalPeriod: 'Rental Period',
      items: 'items',
      item: 'item',
    },

    // Profile page
    profile: {
      title: 'Profile',
      personalInfo: 'Personal Information',
      name: 'Name',
      phone: 'Phone',
      editProfile: 'Edit Profile',
      addresses: 'Addresses',
      addAddress: 'Add Address',
      noAddresses: 'No saved addresses',
      defaultAddress: 'Default Address',
      setAsDefault: 'Set as Default',
      deleteAddress: 'Delete Address',
      saveName: 'Save',
      nameUpdated: 'Name updated',
      updateError: 'Update failed',
    },

    // Orders page
    orders: {
      title: 'My Orders',
      empty: 'You have no orders yet',
      emptyDescription: 'Place your first order from catalog',
      orderNumber: 'Order #',
      status: {
        CONFIRMED: 'Confirmed',
        PREPARING: 'Preparing',
        DELIVERED: 'Delivered',
        RETURNED: 'Returned',
        CANCELLED: 'Cancelled',
      },
      deliveryType: {
        DELIVERY: 'Delivery',
        SELF_PICKUP: 'Self Pickup',
      },
      viewDetails: 'View Details',
      orderDate: 'Order Date',
      rentalPeriod: 'Rental Period',
      totalAmount: 'Total Amount',
    },

    // Favorites page
    favoritesPage: {
      title: 'Favorites',
      empty: 'Favorites list is empty',
      emptyDescription: 'Add items you like by tapping the heart icon',
    },

    // Checkout page
    checkout: {
      title: 'Checkout',
      deliveryMethod: 'Delivery Method',
      delivery: 'Delivery',
      selfPickup: 'Self Pickup',
      deliveryAddress: 'Delivery Address',
      selectAddress: 'Select Address',
      addNewAddress: 'Add New Address',
      pickupAddress: 'Pickup Address',
      paymentMethod: 'Payment Method',
      orderNotes: 'Order Notes',
      notesPlaceholder: 'Additional information about your order...',
      orderSummary: 'Your Order',
      placeOrder: 'Place Order',
      processing: 'Processing...',
      orderSuccess: 'Order placed successfully!',
      orderSuccessDescription: 'We will contact you for confirmation',
      orderError: 'Failed to place order',
      emptyCart: 'Cart is empty',
      goToOrders: 'My Orders',
    },
  },
};

// Define type based on structure, not literal values
export type TranslationKeys = typeof translations['ru'];

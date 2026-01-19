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
  },
};

// Define type based on structure, not literal values
export type TranslationKeys = typeof translations['ru'];

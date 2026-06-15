export const uk = {
  translation: {
    auth: {
      email: 'EMAIL',
      password: 'PASSWORD',
      username: 'USERNAME',
      forgotPassword: 'Забули пароль?',
      noAccount: 'Немає акаунту?',
      hasAccount: 'Вже є акаунт?',
      register: 'Зареєструватись',
      login: 'Увійти',
      loginGoogle: 'Увійти через Google',
      registerGoogle: 'Зареєструватись через Google',
      or: 'або',
      backToLogin: 'Повернутись до входу',
    },

    loginPage: {
      title: 'Welcome back',
      subtitle: 'Раді бачити тебе знову!',
      submitBtn: 'Увійти',
      loading: 'Завантаження...',
      successMsg: 'Вхід успішний',
      errorMsg: 'Не вдалося увійти',
      emailPlaceholder: 'your@email.com',
      passwordPlaceholder: 'Введи пароль',
    },

    registerPage: {
      title: 'Створити акаунт',
      subtitle: 'Приєднуйся до чату!',
      submitBtn: 'Зареєструватись',
      loading: 'Завантаження...',
      errorMsg: 'Не вдалося зареєструватись',
      usernamePlaceholder: '3-20 символів, тільки літери, цифри, _ та -',
      emailPlaceholder: 'your@email.com',
      passwordPlaceholder:
        'Мін. 8 символів, велика/мала літера, цифра, спецсимвол',
      checkEmail: 'Перевір пошту',
      checkEmailDesc: 'Ми надіслали листа на',
      checkEmailDesc2: 'Перейди за посиланням у листі щоб активувати акаунт. Якщо листа немає - перевір папку Спам.',
      googleAccountExists: 'Акаунт з цим Google email вже існує.',
    },

    forgotPassword: {
      title: 'Забули пароль?',
      subtitle:
        'Введи свій email і ми надішлемо посилання для скидання пароля.',
      submitBtn: 'Надіслати посилання',
      sending: 'Надсилання...',
      sentTitle: 'Перевір пошту',
      sentDesc: 'Якщо акаунт з адресою',
      sentDesc2: 'існує, ми надіслали інструкції для скидання пароля. Якщо листа немає - перевір папку Спам.',
      errorMsg: 'Щось пішло не так',
    },

    resetPassword: {
      title: 'Новий пароль',
      subtitle: 'Введи новий пароль для свого акаунту.',
      label: 'НОВИЙ ПАРОЛЬ',
      placeholder: 'Мін. 8 символів, велика/мала літера, цифра, спецсимвол',
      submitBtn: 'Зберегти пароль',
      saving: 'Збереження...',
      successMsg: 'Пароль успішно змінено',
      errorMsg: 'Щось пішло не так',
    },

    activation: {
      title: 'Активація акаунту',
      checking: 'Перевіряємо посилання...',
      successTitle: 'Акаунт активовано!',
      successDesc: 'Перенаправляємо до чату...',
      errorTitle: 'Помилка активації',
      invalidLink: 'Невалідне посилання активації',
      registerAgain: 'Зареєструватись знову',
      successMsg: 'Акаунт активовано!',
    },

    setupProfile: {
      title: 'Майже готово!',
      subtitle: 'Обери собі унікальний username.',
      warning: '⚠️ Username не можна змінити після створення акаунту.',
      submitBtn: 'Створити акаунт',
      creating: 'Створення...',
      successMsg: 'Акаунт створено!',
      invalidLink: 'Невалідне посилання',
      errorMsg: 'Щось пішло не так',
    },

    googleCallback: {
      title: 'Вхід через Google',
      loading: 'Завершуємо авторизацію...',
      errorTitle: 'Помилка входу',
      errorGoogle: 'Не вдалося увійти через Google. Спробуй ще раз.',
      errorNoToken: 'Токен не отримано',
      errorFinish: 'Не вдалося завершити вхід',
    },

    notFound: {
      title: 'Сторінку не знайдено',
      desc: 'Схоже, ця сторінка зникла в невідомому напрямку. Але чат все ще тут!',
      backBtn: '← Повернутись до чату',
      hint: 'Якщо вважаєш що це помилка — напиши адміністратору',
    },

    sidebar: {
      global: 'global',

      rooms: 'КІМНАТИ',
      direct: 'ПРИВАТНІ ПОВІДОМЛЕННЯ',

      online: 'ОНЛАЙН',
      offline: 'ОФЛАЙН',

      createRoom: 'Створити кімнату',
      noRooms: 'Немає кімнат',
    },

    roomModal: {
      title: 'Створити кімнату',
      subtitle: 'Створи нову кімнату для спілкування',

      nameLabel: 'НАЗВА КІМНАТИ',
      descLabel: "ОПИС (необов'язково)",

      namePlaceholder: 'наприклад: general',
      descPlaceholder: 'Про що ця кімната?',

      cancel: 'Скасувати',
      create: 'Створити',
      creating: 'Створення...',

      success: 'Кімнату створено',
      error: 'Не вдалося створити кімнату',
    },

    typing: {
      one: 'друкує...',
      many: 'друкують...',
    },

    profile: {
      online: '● Онлайн',
      offline: '● Офлайн',

      about: 'ПРО СЕБЕ',
      lastSeen: 'ОСТАННІЙ РАЗ ОНЛАЙН',
      memberSince: 'УЧАСНИК З',

      edit: 'Редагувати профіль',
      logout: 'Вийти з акаунту',
      message: 'Написати',
    },

    editProfile: {
      tabs: {
        profile: 'Профіль',
        password: 'Пароль',
      },

      bio: 'Біографія',
      avatar: 'Аватар',
      uploadPhoto: 'Завантажити фото',
      savePhoto: 'Зберегти фото',
      cancel: 'Скасувати',
      deletePhoto: 'Видалити фото',
      reset: 'Скинути',
      bannerColor: 'Колір банера',

      bioPlaceholder: 'Розкажи про себе...',
      bioCounter: '{{count}}/200',

      avatarHint: 'JPG, PNG, WebP, GIF — до 5MB',

      password: {
        current: 'ПОТОЧНИЙ ПАРОЛЬ',
        new: 'НОВИЙ ПАРОЛЬ',
        currentPlaceholder: 'Введи поточний пароль',
        newPlaceholder:
          'Мін. 8 символів, велика/мала літера, цифра, спецсимвол',
        save: 'Змінити пароль',
      },

      actions: {
        save: 'Зберегти',
        saving: 'Збереження...',
        cancel: 'Скасувати',
      },

      messages: {
        profileUpdated: 'Профіль оновлено',
        photoUploaded: 'Фото завантажено',
        photoDeleted: 'Фото видалено',
        passwordChanged: 'Пароль змінено',

        uploadError: 'Не вдалося завантажити фото',
        deleteError: 'Не вдалося видалити фото',
        saveError: 'Не вдалося зберегти профіль',
        passwordError: 'Не вдалося змінити пароль',

        invalidFormat: 'Дозволені формати: jpg, png, webp, gif',
        fileTooLarge: 'Максимальний розмір файлу — 5MB',

        passwordMismatch: 'Новий пароль має відрізнятись від старого',
      },
    },

    emptyChat: {
      privateTitle: 'Початок розмови',
      privateDescription: 'Надішли перше повідомлення та розпочни спілкування.',

      roomTitle: 'У кімнаті ще немає повідомлень',
      roomDescription: 'Будь першим, хто напише повідомлення.',
    },

    messageInput: {
      placeholderGlobal: 'Написати в #global',
      placeholderRoom: 'Написати в #',
      placeholderPrivate: 'Написати @',

      sending: 'Надсилання',
      send: 'Надіслати',
    },

    lastSeen: {
      longTimeAgo: 'давно',
      justNow: 'щойно',
      minutesAgo: 'хв тому',
      hoursAgo: 'год тому',
      daysAgo: 'дн тому',
    },

    userHoverCard: {
      online: 'Онлайн',
      lastSeen: 'Був',
      message: 'Написати',
    },

    date: {
      today: 'Сьогодні',
      yesterday: 'Вчора',
    },

    search: {
      searching: 'Пошук...',
      found: 'Знайдено {{count}} повідомлень',
      empty: 'Нічого не знайдено',
      minChars: 'Введіть мінімум 2 символи',
      close: 'Закрити',
      noResultsFor: 'За запитом «{{query}}» нічого не знайдено',
    },

    messages: {
      loading: 'Завантаження...',

      actions: {
        react: 'Додати реакцію',
        reply: 'Відповісти',
        more: 'Ще',
        edit: 'Редагувати',
        deleteForAll: 'Видалити для всіх',
        deleteForMe: 'Видалити для мене',
        pin: 'Закріпити',
        unpin: 'Відкріпити',
        save: 'Зберегти',
        cancel: 'Скасувати',
      },

      system: {
        pinned: 'Закріплено',
        edited: 'відредаговано',
        deleted: 'Повідомлення видалено',
      },
    },

    theme: {
      toggleTitle: 'Змінити тему',
      light: 'Світла',
      dark: 'Темна',
      lang: 'Змінити мову',
    },

    topBar: {
      online: 'онлайн',
      searchPlaceholder: 'Пошук повідомлень...',
      searchTitle: 'Пошук',
      clear: 'Очистити',
      menu: 'Меню',
      infoAboutRoom: 'Інформація про кімнату',
    },

    app: {
      loadingChat: 'Завантаження чату…',
      reconnecting: 'Перепідключення до сервера…',
      backendLoading: 'Запускаємо сервер... Це може зайняти до хвилини.',
    },

    validation: {
      usernameTooShort: 'Username занадто короткий (мін. 3 символи)',
      usernameTooLong: 'Username занадто довгий (макс. 20 символів)',
      usernameInvalid: 'Username може містити тільки літери, цифри, _ та -',

      emailInvalid: 'Невалідний email',

      passwordTooShort: 'Пароль має бути мінімум 8 символів',
      passwordTooLong: 'Пароль занадто довгий',
      passwordUppercase: 'Пароль має містити хоча б одну велику літеру',
      passwordLowercase: 'Пароль має містити хоча б одну малу літеру',
      passwordNumber: 'Пароль має містити хоча б одну цифру',
      passwordSpecial: 'Пароль має містити хоча б один спецсимвол',

      passwordEmpty: 'Пароль не може бути порожнім',
      oldPasswordRequired: 'Поточний пароль обовʼязковий',
      passwordMismatch: 'Новий пароль має відрізнятись від старого',
    },

    room: {
      left: 'Ви вийшли з кімнати',
      leaveError: 'Не вдалося вийти з кімнати',

      deleted: 'Кімнату видалено',
      deleteError: 'Не вдалося видалити кімнату',
    },

    roomInfo: {
      title: 'Про кімнату',

      room: 'КІМНАТА',
      description: 'ОПИС',
      created: 'СТВОРЕНО',
      members: 'УЧАСНИКИ',

      you: 'ти',

      leave: 'Вийти з кімнати',

      deleteRoom: 'Видалити кімнату',

      deleteConfirm: 'Видалити кімнату',
      irreversible: 'Це незворотньо.',
      descriptionUpdateError: 'Не вдалося оновити опис',

      delete: 'Видалити',
      cancel: 'Скасувати',
      save: 'Зберегти',
    },

    notify: {
      loadMessagesError: 'Не вдалося завантажити повідомлення',
      findMessageError: 'Не вдалося знайти повідомлення',
      searchError: 'Помилка пошуку',
      loginSuccess: 'Вхід успішний',
      loginFailed: 'Не вдалося увійти',
      error: 'Помилка',
      refreshFailed: 'Не вдалося оновити сесію',
      sessionExpired: 'Сесія закінчилась. Виконується вихід...',
      noServerConnection: 'Немає підключення до сервера',
    },

    lang: {
      ua: 'UA',
      en: 'EN',
    },
  },
};

export const en = {
  translation: {
    auth: {
      email: 'EMAIL',
      password: 'PASSWORD',
      username: 'USERNAME',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      register: 'Sign up',
      login: 'Sign in',
      loginGoogle: 'Sign in with Google',
      registerGoogle: 'Sign up with Google',
      or: 'or',
      backToLogin: 'Back to login',
    },

    loginPage: {
      title: 'Welcome back',
      subtitle: 'Glad to see you again!',
      submitBtn: 'Sign in',
      loading: 'Loading...',
      successMsg: 'Logged in successfully',
      errorMsg: 'Failed to sign in',
      emailPlaceholder: 'your@email.com',
      passwordPlaceholder: 'Enter your password',
    },

    registerPage: {
      title: 'Create account',
      subtitle: 'Join the chat!',
      submitBtn: 'Sign up',
      loading: 'Loading...',
      errorMsg: 'Failed to sign up',
      usernamePlaceholder: '3-20 characters, letters, digits, _ and -',
      emailPlaceholder: 'your@email.com',
      passwordPlaceholder: 'Min 8 chars, upper/lower, digit, special char',
      checkEmail: 'Check your email',
      checkEmailDesc: 'We sent a letter to',
      checkEmailDesc2:
        '. Click the link in the email to activate your account.',
      googleAccountExists: 'An account with this Google email already exists.',
    },

    forgotPassword: {
      title: 'Forgot password?',
      subtitle: 'Enter your email and we will send a reset link.',
      submitBtn: 'Send reset link',
      sending: 'Sending...',
      sentTitle: 'Check your email',
      sentDesc: 'If an account with',
      sentDesc2: 'exists, we sent reset instructions.',
      errorMsg: 'Something went wrong',
    },

    resetPassword: {
      title: 'New password',
      subtitle: 'Enter a new password for your account.',
      label: 'NEW PASSWORD',
      placeholder: 'Min 8 chars, upper/lower, digit, special char',
      submitBtn: 'Save password',
      saving: 'Saving...',
      successMsg: 'Password changed successfully',
      errorMsg: 'Something went wrong',
    },

    activation: {
      title: 'Account activation',
      checking: 'Verifying link...',
      successTitle: 'Account activated!',
      successDesc: 'Redirecting to chat...',
      errorTitle: 'Activation error',
      invalidLink: 'Invalid activation link',
      registerAgain: 'Sign up again',
      successMsg: 'Account activated!',
    },

    setupProfile: {
      title: 'Almost done!',
      subtitle: 'Choose a unique username.',
      warning: '⚠️ Username cannot be changed after account creation.',
      submitBtn: 'Create account',
      creating: 'Creating...',
      successMsg: 'Account created!',
      invalidLink: 'Invalid link',
      errorMsg: 'Something went wrong',
    },

    googleCallback: {
      title: 'Sign in with Google',
      loading: 'Finishing authorization...',
      errorTitle: 'Sign in error',
      errorGoogle: 'Failed to sign in with Google. Please try again.',
      errorNoToken: 'Token not received',
      errorFinish: 'Failed to finish sign in',
    },

    notFound: {
      title: 'Page not found',
      desc: 'Looks like this page disappeared. But the chat is still here!',
      backBtn: '← Back to chat',
      hint: 'If you think this is an error — contact the administrator',
    },

    sidebar: {
      global: 'global',

      rooms: 'ROOMS',
      direct: 'DIRECT MESSAGES',

      online: 'ONLINE',
      offline: 'OFFLINE',

      createRoom: 'Create room',
      noRooms: 'No rooms',
    },

    roomModal: {
      title: 'Create room',
      subtitle: 'Create a new room for chatting',

      nameLabel: 'ROOM NAME',
      descLabel: 'DESCRIPTION (optional)',

      namePlaceholder: 'e.g. general',
      descPlaceholder: 'What is this room about?',

      cancel: 'Cancel',
      create: 'Create',
      creating: 'Creating...',

      success: 'Room created',
      error: 'Failed to create room',
    },

    typing: {
      one: 'is typing...',
      many: 'are typing...',
    },

    profile: {
      online: '● Online',
      offline: '● Offline',

      about: 'ABOUT',
      lastSeen: 'LAST SEEN',
      memberSince: 'MEMBER SINCE',

      edit: 'Edit profile',
      logout: 'Log out',
      message: 'Message',
    },

    editProfile: {
      tabs: {
        profile: 'Profile',
        password: 'Password',
      },

      bio: 'Bio',
      avatar: 'Avatar',
      uploadPhoto: 'Upload photo',
      savePhoto: 'Save photo',
      cancel: 'Cancel',
      deletePhoto: 'Delete photo',
      reset: 'Reset',
      bannerColor: 'Banner color',

      bioPlaceholder: 'Tell something about yourself...',
      bioCounter: '{{count}}/200',

      avatarHint: 'JPG, PNG, WebP, GIF — up to 5MB',

      password: {
        current: 'CURRENT PASSWORD',
        new: 'NEW PASSWORD',
        currentPlaceholder: 'Enter current password',
        newPlaceholder: 'Min 8 chars, upper/lowercase, number, special char',
        save: 'Change password',
      },

      actions: {
        save: 'Save',
        saving: 'Saving...',
        cancel: 'Cancel',
      },

      messages: {
        profileUpdated: 'Profile updated',
        photoUploaded: 'Photo uploaded',
        photoDeleted: 'Photo deleted',
        passwordChanged: 'Password changed',

        uploadError: 'Failed to upload photo',
        deleteError: 'Failed to delete photo',
        saveError: 'Failed to save profile',
        passwordError: 'Failed to change password',

        invalidFormat: 'Allowed formats: jpg, png, webp, gif',
        fileTooLarge: 'Maximum file size is 5MB',

        passwordMismatch: 'New password must be different from old one',
      },
    },

    emptyChat: {
      privateTitle: 'Start a conversation',
      privateDescription: 'Send your first message and start chatting.',

      roomTitle: 'No messages in this room yet',
      roomDescription: 'Be the first to send a message.',
    },

    messageInput: {
      placeholderGlobal: 'Write in #global',
      placeholderRoom: 'Write in #',
      placeholderPrivate: 'Write to @',

      sending: 'Sending',
      send: 'Send',
    },

    lastSeen: {
      longTimeAgo: 'long time ago',
      justNow: 'just now',
      minutesAgo: 'min ago',
      hoursAgo: 'hr ago',
      daysAgo: 'days ago',
    },

    userHoverCard: {
      online: 'Online',
      lastSeen: 'Last seen',
      message: 'Message',
    },

    date: {
      today: 'Today',
      yesterday: 'Yesterday',
    },

    search: {
      searching: 'Searching...',
      found: 'Found {{count}} messages',
      empty: 'No results found',
      minChars: 'Enter at least 2 characters',
      close: 'Close',
      noResultsFor: 'No results found for "{{query}}"',
    },

    messages: {
      loading: 'Loading...',

      actions: {
        react: 'Add reaction',
        reply: 'Reply',
        more: 'More',
        edit: 'Edit',
        deleteForAll: 'Delete for everyone',
        deleteForMe: 'Delete for me',
        pin: 'Pin',
        unpin: 'Unpin',
        save: 'Save',
        cancel: 'Cancel',
      },

      system: {
        pinned: 'Pinned',
        edited: 'edited',
        deleted: 'Message deleted',
      },
    },

    theme: {
      toggleTitle: 'Change theme',
      light: 'Light',
      dark: 'Dark',
      lang: 'Change language',
    },

    topBar: {
      online: 'online',
      searchPlaceholder: 'Search messages...',
      searchTitle: 'Search',
      clear: 'Clear',
      menu: 'Menu',
      infoAboutRoom: 'Room information',
    },

    app: {
      loadingChat: 'Loading chat…',
      reconnecting: 'Reconnecting to server…',
      backendLoading: 'Starting server... This may take up to a minute.',
    },

    validation: {
      usernameTooShort: 'Username is too short (min 3 characters)',
      usernameTooLong: 'Username is too long (max 20 characters)',
      usernameInvalid: 'Username can only contain letters, numbers, _ and -',

      emailInvalid: 'Invalid email address',

      passwordTooShort: 'Password must be at least 8 characters',
      passwordTooLong: 'Password is too long',
      passwordUppercase: 'Password must contain at least one uppercase letter',
      passwordLowercase: 'Password must contain at least one lowercase letter',
      passwordNumber: 'Password must contain at least one number',
      passwordSpecial: 'Password must contain at least one special character',

      passwordEmpty: 'Password cannot be empty',
      oldPasswordRequired: 'Old password is required',
      passwordMismatch: 'New password must be different from old password',
    },

    room: {
      left: 'You left the room',
      leaveError: 'Failed to leave the room',

      deleted: 'Room deleted',
      deleteError: 'Failed to delete the room',
    },

    roomInfo: {
      title: 'About room',

      room: 'ROOM',
      description: 'DESCRIPTION',
      created: 'CREATED',
      members: 'MEMBERS',

      you: 'you',

      leave: 'Leave room',

      deleteRoom: 'Delete room',

      deleteConfirm: 'Delete room',
      irreversible: 'This action cannot be undone.',
      descriptionUpdateError: 'Failed to update description',

      delete: 'Delete',
      cancel: 'Cancel',
      save: 'Save',
    },

    notify: {
      loadMessagesError: 'Failed to load messages',
      findMessageError: 'Failed to find message',
      searchError: 'Search failed',
      loginSuccess: 'Logged in successfully',
      loginFailed: 'Failed to sign in',
      error: 'Error',
      refreshFailed: 'Failed to refresh session',
      sessionExpired: 'Session expired. Logging out...',
      noServerConnection: 'No connection to server',
    },

    lang: {
      ua: 'UA',
      en: 'EN',
    },
  },
};

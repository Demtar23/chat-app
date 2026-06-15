import axios from 'axios';

type Locale = 'uk' | 'en';

const translations = {
  uk: {
    activationSubject: 'Підтвердження email — ChatApp',
    activationTitle: 'Підтвердіть вашу email-адресу',
    activationText:
      'Дякуємо за реєстрацію! Натисніть кнопку нижче, щоб активувати акаунт.',
    activationButton: 'Підтвердити email',

    resetSubject: 'Скидання пароля — ChatApp',
    resetTitle: 'Скидання пароля',
    resetText:
      'Ми отримали запит на зміну пароля. Натисніть кнопку нижче, щоб створити новий пароль.',
    resetButton: 'Скинути пароль',

    copyLink: 'Або скопіюйте посилання:',
    activationExpires: 'Посилання дійсне 24 години',
    resetExpires: 'Посилання дійсне 1 годину',
  },

  en: {
    activationSubject: 'Verify your email — ChatApp',
    activationTitle: 'Verify your email address',
    activationText:
      'Thank you for registering! Click the button below to activate your account.',
    activationButton: 'Verify email',

    resetSubject: 'Reset password — ChatApp',
    resetTitle: 'Reset password',
    resetText:
      'We received a request to reset your password. Click the button below to create a new password.',
    resetButton: 'Reset password',

    copyLink: 'Or copy the link:',
    activationExpires: 'This link is valid for 24 hours',
    resetExpires: 'This link is valid for 1 hour',
  },
} as const;

export const send = async (email: string, subject: string, html: string) => {
  try {
    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'ChatApp',
          email: process.env.FROM_EMAIL!,
        },
        to: [{ email }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY!,
          'content-type': 'application/json',
        },
      },
    );
  } catch (err) {
    console.error('❌ EMAIL SEND FAILED:', err);
    throw err;
  }
};

export const sendActivationLink = (
  email: string,
  activationToken: string,
  locale: Locale,
) => {
  const link = `${process.env.CLIENT_URL}/auth/activation/${activationToken}`;
  const t = translations[locale];

  const html = `
  <body style="margin:0;background:#f5f6f8;font-family:Segoe UI,Arial,sans-serif;">
    <table width="100%" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table width="480" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#5865f2;padding:28px;text-align:center;">
                <h1 style="margin:0;color:white;font-size:22px;">💬 ChatApp</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:40px 32px;">
                <h2>${t.activationTitle}</h2>
                <p>${t.activationText}</p>

                <div style="text-align:center;margin:24px 0;">
                  <a href="${link}"
                    style="background:#5865f2;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;">
                    ${t.activationButton}
                  </a>
                </div>

                <p>${t.copyLink}</p>
                <p style="word-break:break-all;color:#5865f2;">${link}</p>
              </td>
            </tr>

            <tr>
              <td style="text-align:center;padding:16px;border-top:1px solid #e5e7eb;">
                <p style="font-size:12px;color:#9ca3af;">
                  ${t.activationExpires}
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  `;

  return send(email, t.activationSubject, html);
};

export const sendResetLink = (
  email: string,
  resetToken: string,
  locale: Locale,
) => {
  const link = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;
  const t = translations[locale];

  const html = `
  <body style="margin:0;background:#f5f6f8;font-family:Segoe UI,Arial,sans-serif;">
    <table width="100%" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table width="480" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#ed4245;padding:28px;text-align:center;">
                <h1 style="margin:0;color:white;font-size:22px;">💬 ChatApp</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:40px 32px;">
                <h2>${t.resetTitle}</h2>
                <p>${t.resetText}</p>

                <div style="text-align:center;margin:24px 0;">
                  <a href="${link}"
                    style="background:#ed4245;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;">
                    ${t.resetButton}
                  </a>
                </div>

                <p>${t.copyLink}</p>
                <p style="word-break:break-all;color:#ed4245;">${link}</p>
              </td>
            </tr>

            <tr>
              <td style="text-align:center;padding:16px;border-top:1px solid #e5e7eb;">
                <p style="font-size:12px;color:#9ca3af;">
                  ${t.resetExpires}
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  `;

  return send(email, t.resetSubject, html);
};

export const mailer = {
  send,
  sendActivationLink,
  sendResetLink,
};

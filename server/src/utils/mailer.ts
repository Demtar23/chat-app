import nodemailer from 'nodemailer';

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

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const send = (email: string, subject: string, html: string) => {
  return transporter.sendMail({
    from: `"ChatApp" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    html,
  });
};

/**
 * =======================
 * ACTIVATION EMAIL
 * =======================
 */
export const sendActivationLink = (
  email: string,
  activationToken: string,
  locale: Locale,
) => {
  const link = `${process.env.CLIENT_URL}/auth/activation/${activationToken}`;

  const t = translations[locale];

  const subject = t.activationSubject;

  const html = `
  <body style="margin:0;background:#f5f6f8;font-family:Segoe UI,Arial,sans-serif;">
    <table width="100%" style="padding:40px 0;">
      <tr>
        <td align="center">

          <table width="480" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

            <tr>
              <td style="background:#5865f2;padding:28px;text-align:center;">
                <h1 style="margin:0;color:white;font-size:22px;">
                  💬 ChatApp
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:40px 32px;">
                <h2 style="margin:0 0 12px;color:#111827;">
                  ${t.activationTitle}
                </h2>

                <p style="color:#6b7280;line-height:1.6;">
                  ${t.activationText}
                </p>

                <div style="text-align:center;margin:24px 0;">
                  <a href="${link}"
                    style="background:#5865f2;color:white;
                           padding:14px 28px;border-radius:8px;
                           text-decoration:none;font-weight:600;display:inline-block;">
                    ${t.activationButton}
                  </a>
                </div>

                <p style="color:#6b7280;font-size:13px;">
                  ${t.copyLink}
                </p>

                <p style="color:#5865f2;font-size:12px;word-break:break-all;">
                  ${link}
                </p>

              </td>
            </tr>

            <tr>
              <td style="padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#9ca3af;font-size:12px;margin:0;">
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

  return send(email, subject, html);
};

/**
 * =======================
 * RESET PASSWORD EMAIL
 * =======================
 */
export const sendResetLink = (
  email: string,
  resetToken: string,
  locale: Locale,
) => {
  const link = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;

  const t = translations[locale];

  const subject = t.resetSubject;

  const html = `
  <body style="margin:0;background:#f5f6f8;font-family:Segoe UI,Arial,sans-serif;">
    <table width="100%" style="padding:40px 0;">
      <tr>
        <td align="center">

          <table width="480" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

            <tr>
              <td style="background:#ed4245;padding:28px;text-align:center;">
                <h1 style="margin:0;color:white;font-size:22px;">
                  💬 ChatApp
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:40px 32px;">
                <h2 style="margin:0 0 12px;color:#111827;">
                  ${t.resetTitle}
                </h2>

                <p style="color:#6b7280;line-height:1.6;">
                  ${t.resetText}
                </p>

                <div style="text-align:center;margin:24px 0;">
                  <a href="${link}"
                    style="background:#ed4245;color:white;
                           padding:14px 28px;border-radius:8px;
                           text-decoration:none;font-weight:600;display:inline-block;">
                    ${t.resetButton}
                  </a>
                </div>

                <p style="color:#6b7280;font-size:13px;">
                  ${t.copyLink}
                </p>

                <p style="color:#ed4245;font-size:12px;word-break:break-all;">
                  ${link}
                </p>

              </td>
            </tr>

            <tr>
              <td style="padding:16px;text-align:center;border-top:1px solid #e5e7eb;">
                <p style="color:#9ca3af;font-size:12px;margin:0;">
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

  return send(email, subject, html);
};

export const mailer = {
  send,
  sendActivationLink,
  sendResetLink,
};

import nodemailer from 'nodemailer';

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

export const sendActivationLink = async (email: string, activationToken: string) => {
  const link = `${process.env.CLIENT_URL}/auth/activation/${activationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background:#1e1f22;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0"
                style="background:#2b2d31;border-radius:12px;overflow:hidden;">

                <!-- header -->
                <tr>
                  <td style="background:#5865f2;padding:32px;text-align:center;">
                    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:0.5px;">
                      💬 ChatApp
                    </h1>
                  </td>
                </tr>

                <!-- body -->
                <tr>
                  <td style="padding:40px 32px;">
                    <h2 style="margin:0 0 12px;color:#fff;font-size:20px;font-weight:600;">
                      Підтвердіть вашу email-адресу
                    </h2>
                    <p style="margin:0 0 24px;color:#b5bac1;font-size:15px;line-height:1.6;">
                      Дякуємо за реєстрацію! Натисніть кнопку нижче, щоб підтвердити вашу email-адресу та активувати обліковий запис.
                    </p>

                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding:8px 0 32px;">
                          <a href="${link}"
                            style="display:inline-block;padding:14px 32px;background:#5865f2;color:#fff;
                                   text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;
                                   letter-spacing:0.3px;">
                            Підтвердити email
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 8px;color:#b5bac1;font-size:13px;">
                      Або скопіюйте посилання у браузер:
                    </p>
                    <p style="margin:0;padding:12px;background:#1e1f22;border-radius:6px;
                               color:#5865f2;font-size:12px;word-break:break-all;">
                      ${link}
                    </p>
                  </td>
                </tr>

                <!-- footer -->
                <tr>
                  <td style="padding:20px 32px;border-top:1px solid #1e1f22;">
                    <p style="margin:0;color:#6d6f78;font-size:12px;text-align:center;line-height:1.5;">
                      Посилання дійсне 24 години.<br/>
                      Якщо ви не реєструвалися — просто ігноруйте цей лист.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return send(email, 'Підтвердіть вашу email-адресу — ChatApp', html);
};

export const sendResetLink = (email: string, resetToken: string) => {
  const link = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background:#1e1f22;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0"
                style="background:#2b2d31;border-radius:12px;overflow:hidden;">

                <tr>
                  <td style="background:#ed4245;padding:32px;text-align:center;">
                    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">
                      💬 ChatApp
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:40px 32px;">
                    <h2 style="margin:0 0 12px;color:#fff;font-size:20px;font-weight:600;">
                      Скидання пароля
                    </h2>
                    <p style="margin:0 0 24px;color:#b5bac1;font-size:15px;line-height:1.6;">
                      Ми отримали запит на скидання пароля для вашого облікового запису. Натисніть кнопку нижче, щоб створити новий пароль.
                    </p>

                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding:8px 0 32px;">
                          <a href="${link}"
                            style="display:inline-block;padding:14px 32px;background:#ed4245;color:#fff;
                                   text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
                            Скинути пароль
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 8px;color:#b5bac1;font-size:13px;">
                      Або скопіюйте посилання у браузер:
                    </p>
                    <p style="margin:0;padding:12px;background:#1e1f22;border-radius:6px;
                               color:#ed4245;font-size:12px;word-break:break-all;">
                      ${link}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:20px 32px;border-top:1px solid #1e1f22;">
                    <p style="margin:0;color:#6d6f78;font-size:12px;text-align:center;line-height:1.5;">
                      Посилання дійсне 1 годину.<br/>
                      Якщо ви не запитували скидання пароля — просто ігноруйте цей лист.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return send(email, 'Скидання пароля — ChatApp', html);
};

export const mailer = {
  send,
  sendActivationLink,
  sendResetLink,
};
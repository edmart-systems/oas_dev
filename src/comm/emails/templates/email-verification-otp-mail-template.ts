export const emailVerCodeOtpEmailTemplate = ({
  firstName,
  verCode,
}: {
  firstName: string;
  verCode: string;
}): string | null => {
  try {
    const template = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification OTP</title>
    <style>
       body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        display: flex;
        align-content: center;
        justify-content: center;
        font-size: 18px;
      }

      .container {
        max-width: 60vh;
        margin: auto;
        padding: 20px;
        border: 1px solid #ec8b39;
        border-radius: 8px;
      }

      h2 {
        color: #333333;
        text-align: center;
      }

      p {
        color: #555555;
        line-height: 1.5;
        text-align: center;
      }

      .otp {
        font-size: 24px;
        font-weight: bold;
        color: #ec8b39;
        text-align: center;
        margin: 20px 0;
      }

      .footer {
        font-size: 14px;
        color: #777777;
        text-align: center;
        margin-top: 20px;
      }

      .footer a {
        color: #ec8b39;
        text-decoration: none;
      }

      .footer p {
        margin: 0 0 0 0;
      }

      .powered-by {
        color: #ec8b39;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Email Verification</h2>
      <p>Dear ${firstName},</p>
      <p>
        Thank you for signing up! Please use the OTP below to verify your email
        address:
      </p>
      <div class="otp">${verCode}</div>
      <p>If you did not request this, please ignore this email.</p>

      <div class="footer">
        <h4 class="m-0 fwp-footer-name">Edmart Office Automation</h4>
        <p>
          Need help? Contact us at
          <a href="mailto:info@oas.edmartsystems.com"
            >info@oas.edmartsystems.com</a
          >
        </p>
        <p>
          Note: This is an automated message. Please do not reply to this email.
        </p>
        <br />
        <p class="powered-by">Powered By, Edmart Systems (U) Limited</p>
      </div>
    </div>
  </body>
</html>
    `;

    return template;
  } catch (err) {
    console.log(err);
    return null;
  }
};

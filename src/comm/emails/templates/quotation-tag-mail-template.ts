import { SessionUser } from "@/server-actions/auth-actions/auth.actions";
import { QuotationId } from "@/types/quotations.types";
import { FullUser } from "@/types/user.types";
import { userNameFormatter } from "@/utils/formatters.util";

export const quotationTagEmailTemplate = ({
  message,
  quotationId,
  quotationIsVariant,
  taggingUser,
  taggedUser,
}: {
  quotationId: QuotationId;
  quotationIsVariant: boolean;
  taggingUser: SessionUser;
  taggedUser: FullUser;
  message: string | null;
}): string | null => {
  try {
    const body1 = `You have been tagged by ${userNameFormatter(
      taggingUser.firstName,
      taggingUser.lastName
    )} (${taggingUser.co_user_id}) on quotation ${
      quotationId.quotationNumber
    } in the system.`;

    const body2 =
      message && message.length > 5
        ? `"${message}${
            message.substring(message.length - 1) === "." ? "" : "."
          }"`
        : "";

    const template = `
      <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quotation Tag Notification ${quotationId.quotationNumber}</title>
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
      <h2>Quotation ${quotationId.quotationNumber} Tag</h2>
      <p>Dear ${taggedUser.firstName},</p>
      <p>${body1}</p>
      ${body2 ? `<p><b>${body2}</b></p>` : ""}
      <p>Kindly log in to your account to review the document and take any necessary action.</p>
      <p>
        If you have any questions, please don&apos;t hesitate to contact us.
      </p>

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

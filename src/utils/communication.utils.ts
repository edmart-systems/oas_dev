import Mail from "nodemailer/lib/mailer";

export const systemEmailSender: Mail.Address = {
  name: "Edmart Office Automation",
  address: "info@oas.edmartsystems.com",
};

export const systemEmailRecipients: Mail.Address[] = [];

export const systemEmailBccRecipients: Mail.Address[] = [];

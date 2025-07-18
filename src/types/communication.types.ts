import Mail from "nodemailer/lib/mailer";

export type SendEmailDto = {
  sender: Mail.Address;
  recipients: Mail.Address[];
  subject: string;
  message: string;
  cc?: Mail.Address[];
  bcc?: Mail.Address[];
  isHtml?: boolean;
};

export type SendSmsDto = {
  body: string;
  from?: string;
  to: string;
};

export type SmsDualResponseDto = {
  success: boolean;
  message: string;
  code: number;
};

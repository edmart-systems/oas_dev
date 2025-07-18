"use server";

import nodemailer, { createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { SendEmailDto } from "../../types/communication.types";

const transport = createTransport({
  host: process.env.NEXT_PUBLIC_MAIL_HOST,
  port: process.env.NEXT_PUBLIC_MAIL_PORT,
  // secure: true,
  auth: {
    user: process.env.NEXT_PUBLIC_MAIL_USER,
    pass: process.env.NEXT_PUBLIC_MAIL_USER_PASS,
  },
} as SMTPTransport.Options);

export const sendEmail = async (email: SendEmailDto) => {
  const { subject, message, sender, recipients, cc, bcc, isHtml } = email;

  return await transport.sendMail({
    from: sender,
    to: recipients,
    subject: subject,
    text: message,
    html: isHtml ? message : "",
    cc: cc,
    bcc: bcc,
  });
};

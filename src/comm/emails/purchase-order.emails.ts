import { purchaseOrderApprovalTemplate, purchaseOrderIssuedTemplate } from "./templates/purchase-order-mail-template";
import { logger } from "@/logger/default-logger";
import { sendEmail } from "./emails.config";
import { SendEmailDto } from "@/types/communication.types";
import { systemEmailSender } from "@/utils/communication.utils";

export const sendPOApprovalEmail = async (data: {
  poNumber: string;
  requesterName: string;
  supplierName: string;
  totalAmount: string;
  currency: string;
  approverName: string;
  approverEmail: string;
}) => {
  try {
    const htmlContent = purchaseOrderApprovalTemplate(data);
    
    const emailData: SendEmailDto = {
      recipients: [{
        name: data.approverName,
        address: data.approverEmail,
      }],
      sender: systemEmailSender,
      subject: `Purchase Order Approval Required - ${data.poNumber}`,
      message: htmlContent,
      isHtml: true,
    };

    const result = await sendEmail(emailData);
    
    if (result.accepted.length > 0) {
      logger.info(`PO approval email sent to ${data.approverEmail} for PO ${data.poNumber}`);
    } else {
      logger.error(`Failed to send approval email to ${data.approverEmail}`);
    }
  } catch (error) {
    logger.error('Failed to send PO approval email:', error);
  }
};

export const sendPORejectionEmail = async (data: {
  poNumber: string;
  requesterName: string;
  requesterEmail: string;
  rejectedBy: string;
  remarks?: string;
}) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Purchase Order Rejected</h2>
        <p>Dear ${data.requesterName},</p>
        <p>Your purchase order <strong>${data.poNumber}</strong> has been rejected by ${data.rejectedBy}.</p>
        ${data.remarks ? `<p><strong>Remarks:</strong> ${data.remarks}</p>` : ''}
        <p>Please review and resubmit if necessary.</p>
        <p>Best regards,<br>Office Automation System</p>
      </div>
    `;
    
    const emailData: SendEmailDto = {
      recipients: [{
        name: data.requesterName,
        address: data.requesterEmail,
      }],
      sender: systemEmailSender,
      subject: `Purchase Order Rejected - ${data.poNumber}`,
      message: htmlContent,
      isHtml: true,
    };

    const result = await sendEmail(emailData);
    
    if (result.accepted.length > 0) {
      logger.info(`PO rejection email sent to ${data.requesterEmail} for PO ${data.poNumber}`);
    } else {
      logger.error(`Failed to send rejection email to ${data.requesterEmail}`);
    }
  } catch (error) {
    logger.error('Failed to send PO rejection email:', error);
  }
};

export const sendPOIssuedEmail = async (data: {
  poNumber: string;
  supplierName: string;
  supplierEmail: string;
  totalAmount: string;
  currency: string;
  expectedDelivery?: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
  }>;
  pdfAttachment?: Buffer;
}) => {
  try {
    const htmlContent = purchaseOrderIssuedTemplate(data);
    
    const emailData: SendEmailDto = {
      recipients: [{
        name: data.supplierName,
        address: data.supplierEmail,
      }],
      sender: systemEmailSender,
      subject: `Purchase Order - ${data.poNumber}`,
      message: htmlContent,
      isHtml: true,
    };

    const result = await sendEmail(emailData);
    
    if (result.accepted.length > 0) {
      logger.info(`PO issued email sent to ${data.supplierEmail} for PO ${data.poNumber}`);
    } else {
      logger.error(`Failed to send PO email to ${data.supplierEmail}`);
    }
  } catch (error) {
    logger.error('Failed to send PO issued email:', error);
  }
};

export const sendPOStatusUpdateEmail = async (data: {
  poNumber: string;
  status: string;
  recipientName: string;
  recipientEmail: string;
  message: string;
}) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Purchase Order Status Update</h2>
        <p>Dear ${data.recipientName},</p>
        <p>Purchase Order <strong>${data.poNumber}</strong> status has been updated to: <strong>${data.status}</strong></p>
        <p>${data.message}</p>
        <p>Best regards,<br>Office Automation System</p>
      </div>
    `;
    
    const emailData: SendEmailDto = {
      recipients: [{
        name: data.recipientName,
        address: data.recipientEmail,
      }],
      sender: systemEmailSender,
      subject: `PO Status Update - ${data.poNumber}`,
      message: htmlContent,
      isHtml: true,
    };

    const result = await sendEmail(emailData);
    
    if (result.accepted.length > 0) {
      logger.info(`PO status update email sent to ${data.recipientEmail} for PO ${data.poNumber}`);
    } else {
      logger.error(`Failed to send status update email to ${data.recipientEmail}`);
    }
  } catch (error) {
    logger.error('Failed to send PO status update email:', error);
  }
};
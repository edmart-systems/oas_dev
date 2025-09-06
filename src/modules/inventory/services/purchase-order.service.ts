import { PurchaseOrderRepository } from "../repositories/purchase-order.repository";
import { PurchaseOrderDraftData } from "../types/purchase-order.types";
import { NotificationService } from "@/services/notification-service/notification.service";
import { NewNotification } from "@/types/notification.types";
import { sendPOApprovalEmail, sendPORejectionEmail, sendPOIssuedEmail, sendPOStatusUpdateEmail } from "@/comm/emails/purchase-order.emails";
import { generatePOPDF } from "@/utils/pdf/purchase-order-pdf.utils";

export class PurchaseOrderService {
  constructor(private repository: PurchaseOrderRepository) {}

  async createPurchaseOrder(data: any, requesterId: number) {
    // Generate PO number
    const poNumber = await this.repository.generatePONumber();
    
    // Create PO
    const po = await this.repository.createPurchaseOrder(data, requesterId, poNumber);
    
    // Create approval steps: Department (2) -> Finance (4) -> Procurement (3)
    const approvers = await this.getApprovalHierarchy();
    await this.repository.createApprovalSteps(po.po_id, approvers);
    
    // Send notification to first approver (Department)
    if (approvers.length > 0) {
      await this.sendPOCreatedNotification(po.po_id, approvers[0].userId);
    }
    
    return po;
  }

  async getPaginatedPurchaseOrders(params: any) {
    return await this.repository.getPaginatedPurchaseOrders(params);
  }

  async getPurchaseOrderById(poId: number) {
    return await this.repository.getPurchaseOrderById(poId);
  }

  async approvePurchaseOrder(poId: number, userId: number, remarks?: string) {
    // Get pending approval for user
    const approval = await this.repository.getPendingApprovalForUser(poId, userId);
    if (!approval) {
      throw new Error("No pending approval found for user");
    }

    // Get PO details for email
    const po = await this.repository.getPurchaseOrderById(poId);
    if (!po) {
      throw new Error("Purchase Order not found");
    }

    // Update approval status
    await this.repository.updateApprovalStatus(approval.approval_id, 'Approved', remarks);

    // Check if all approvals are complete
    const allApprovals = await this.repository.getAllApprovalsForPO(poId);
    const allApproved = allApprovals.every(a => a.status === 'Approved');

    if (allApproved) {
      // Update PO status to Approved
      await this.repository.updatePOStatus(poId, 'Approved', {
        approval_date: new Date()
      });
      
      // Send notification to procurement team
      await this.sendPOFullyApprovedNotification(poId);
    } else {
      // Send notification and email to next approver
      const nextApproval = allApprovals.find(a => a.status === 'Pending');
      if (nextApproval) {
        await this.sendPOApprovedNotification(poId, nextApproval.approver_id);
        
        // Send email to next approver
        const nextApprover = await this.repository.getUserById(nextApproval.approver_id);
        if (nextApprover?.email) {
          await this.sendApprovalEmail(po, nextApprover);
        }
      }
    }

    return { success: true, message: "Purchase Order approved successfully" };
  }

  async rejectPurchaseOrder(poId: number, userId: number, remarks?: string) {
    // Get pending approval for user
    const approval = await this.repository.getPendingApprovalForUser(poId, userId);
    if (!approval) {
      throw new Error("No pending approval found for user");
    }

    // Get approver details
    const approver = await this.repository.getUserById(userId);
    const approverName = approver ? `${approver.firstName} ${approver.lastName}` : 'Approver';

    // Update approval status
    await this.repository.updateApprovalStatus(approval.approval_id, 'Rejected', remarks);

    // Update PO status to Rejected and cancel all other pending approvals
    await this.repository.updatePOStatus(poId, 'Rejected');
    await this.repository.cancelPendingApprovals(poId);

    // Send notification to requester
    const po = await this.repository.getPurchaseOrderById(poId);
    if (po) {
      await this.sendPORejectedNotification(poId, po.requester_id);
      
      // Send email notification
      try {
        await sendPORejectionEmail({
          poNumber: po.po_number,
          requesterName: `${po.requester.firstName} ${po.requester.lastName}`,
          requesterEmail: po.requester.email,
          rejectedBy: approverName,
          remarks,
        });
      } catch (error) {
        console.error('Failed to send rejection email:', error);
      }
    }

    return { success: true, message: "Purchase Order rejected successfully" };
  }

  async issuePurchaseOrder(poId: number) {
    const po = await this.repository.getPurchaseOrderById(poId);
    if (!po || po.status !== 'Approved') {
      throw new Error("PO must be approved before issuing");
    }

    // Update PO status to Issued
    await this.repository.updatePOStatus(poId, 'Issued', {
      issued_date: new Date()
    });

    // Send notifications to all stakeholders
    await this.sendPOIssuedNotifications(poId, po);

    return { success: true };
  }

  // Draft methods
  async savePODraft(userId: number, draftData: PurchaseOrderDraftData, draftType: 'manual' | 'auto' = 'manual') {
    const maxDrafts = 10;
    const currentCount = await this.repository.countUserPODrafts(userId);
    
    if (draftType === 'manual' && currentCount >= maxDrafts) {
      throw new Error("Maximum drafts limit reached");
    }

    return await this.repository.savePODraft(userId, draftData, draftType);
  }

  async getUserPODrafts(userId: number) {
    const drafts = await this.repository.getUserPODrafts(userId);
    return drafts.map(draft => ({
      ...draft,
      draft_data: JSON.parse(draft.draft_data)
    }));
  }

  async deletePODraft(userId: number, draftId: number) {
    const result = await this.repository.deletePODraft(userId, draftId);
    return result.count > 0;
  }

  async deleteAllUserPODrafts(userId: number) {
    return await this.repository.deleteAllUserPODrafts(userId);
  }

  async getLatestAutoDraft(userId: number) {
    const draft = await this.repository.getLatestAutoDraft(userId);
    if (draft) {
      return {
        ...draft,
        draft_data: JSON.parse(draft.draft_data)
      };
    }
    return null;
  }

  async deleteAutoDraft(userId: number) {
    return await this.repository.deleteAutoDraft(userId);
  }

  async getSinglePODraft(userId: number, draftId: number) {
    const draft = await this.repository.getSinglePODraft(userId, draftId);
    if (draft) {
      return {
        ...draft,
        draft_data: JSON.parse(draft.draft_data)
      };
    }
    return null;
  }

  async updatePurchaseOrder(poId: number, data: any, userId: number) {
    const po = await this.repository.getPurchaseOrderById(poId);
    if (!po) {
      throw new Error("Purchase Order not found");
    }

    if (po.status !== 'Pending') {
      throw new Error("Only pending POs can be edited");
    }

    if (po.requester_id !== userId) {
      throw new Error("Only the requester can edit the PO");
    }

    return await this.repository.updatePurchaseOrder(poId, data);
  }

  // Notification methods
  private async sendPOCreatedNotification(poId: number, approverId: number) {
    const notification: NewNotification = {
      title: "New Purchase Order for Approval",
      message: `A new purchase order (PO-${poId}) requires your approval.`,
      time: BigInt(Date.now()),
      userId: approverId,
      type_id: 1,
      template_id: null,
      action_data: poId.toString(),
    };
    
    await NotificationService.recordNewNotification(notification);
  }

  private async sendPOApprovedNotification(poId: number, nextApproverId: number) {
    const notification: NewNotification = {
      title: "Purchase Order Approval Required",
      message: `Purchase order (PO-${poId}) has been approved by previous approver and now requires your approval.`,
      time: BigInt(Date.now()),
      userId: nextApproverId,
      type_id: 1,
      template_id: null,
      action_data: poId.toString(),
    };
    
    await NotificationService.recordNewNotification(notification);
  }

  private async sendPOFullyApprovedNotification(poId: number) {
    // Send to procurement team (role-based notification would be implemented here)
    const notification: NewNotification = {
      title: "Purchase Order Fully Approved",
      message: `Purchase order (PO-${poId}) has been fully approved and is ready for issuance.`,
      time: BigInt(Date.now()),
      userId: 1, // This should be procurement team members
      type_id: 1,
      template_id: null,
      action_data: poId.toString(),
    };
    
    await NotificationService.recordNewNotification(notification);
  }

  private async sendPORejectedNotification(poId: number, requesterId: number) {
    const notification: NewNotification = {
      title: "Purchase Order Rejected",
      message: `Your purchase order (PO-${poId}) has been rejected.`,
      time: BigInt(Date.now()),
      userId: requesterId,
      type_id: 1,
      template_id: null,
      action_data: poId.toString(),
    };
    
    await NotificationService.recordNewNotification(notification);
  }

  private async sendPOIssuedNotifications(poId: number, po: any) {
    const notifications: NewNotification[] = [
      // To requester
      {
        title: "Purchase Order Issued",
        message: `Your purchase order (PO-${poId}) has been issued to the supplier.`,
        time: BigInt(Date.now()),
        userId: po.requester_id,
        type_id: 1,
        template_id: null,
        action_data: poId.toString(),
      }
    ];

    // To all approvers
    for (const approval of po.approvals) {
      notifications.push({
        title: "Purchase Order Issued",
        message: `Purchase order (PO-${poId}) that you approved has been issued.`,
        time: BigInt(Date.now()),
        userId: approval.approver_id,
        type_id: 1,
        template_id: null,
        action_data: poId.toString(),
      });
    }

    await NotificationService.recordNewNotificationsBatch(notifications);

    // Send email to supplier with PDF attachment
    try {
      const pdfBuffer = await generatePOPDF(po);
      await sendPOIssuedEmail({
        poNumber: po.po_number,
        supplierName: po.supplier.supplier_name,
        supplierEmail: po.supplier.supplier_email,
        totalAmount: po.total_amount.toFixed(2),
        currency: po.currency.currency_code,
        expectedDelivery: po.expected_delivery ? new Date(po.expected_delivery).toLocaleDateString() : undefined,
        items: po.items.map((item: any) => ({
          productName: item.product.product_name,
          quantity: item.quantity_ordered,
          unitPrice: item.unit_price.toFixed(2),
          totalPrice: item.total_price.toFixed(2),
        })),
        pdfAttachment: pdfBuffer,
      });
    } catch (error) {
      // Log error but don't fail the operation
      console.error('Failed to send PO email:', error);
    }
  }

  private async getApprovalHierarchy() {
    // Get users by role: Department (2) -> Finance (4) -> Procurement (3)
    const departmentUser = await this.repository.getUserByRole(2);
    const financeUser = await this.repository.getUserByRole(4);
    const procurementUser = await this.repository.getUserByRole(3);
    
    const approvers = [];
    if (departmentUser) approvers.push({ userId: departmentUser.userId, level: 1 });
    if (financeUser) approvers.push({ userId: financeUser.userId, level: 2 });
    if (procurementUser) approvers.push({ userId: procurementUser.userId, level: 3 });
    
    return approvers;
  }

  private async sendApprovalEmail(po: any, approver: any) {
    try {
      await sendPOApprovalEmail({
        poNumber: po.po_number,
        requesterName: `${po.requester.firstName} ${po.requester.lastName}`,
        supplierName: po.supplier.supplier_name,
        totalAmount: po.total_amount.toFixed(2),
        currency: po.currency.currency_code,
        approverName: `${approver.firstName} ${approver.lastName}`,
        approverEmail: approver.email,
      });
    } catch (error) {
      console.error('Failed to send approval email:', error);
    }
  }
}
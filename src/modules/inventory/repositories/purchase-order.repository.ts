import { PrismaClient } from "@prisma/client";
import { PurchaseOrderDraftData } from "../types/purchase-order.types";

export class PurchaseOrderRepository {
  constructor(private prisma: PrismaClient) {}

  async createPurchaseOrder(data: any, requesterId: number, poNumber: string) {
    const totalAmount = data.items.reduce((sum: number, item: any) => sum + item.total_price, 0);
    
    return await this.prisma.purchaseOrder.create({
      data: {
        po_number: poNumber,
        supplier_id: data.supplier_id,
        requester_id: requesterId,
        currency_id: data.currency_id,
        total_amount: totalAmount,
        expected_delivery: data.expected_delivery ? new Date(data.expected_delivery) : null,
        remarks: data.remarks,
        items: {
          create: data.items.map((item: any) => ({
            product_id: item.product_id,
            description: item.description,
            quantity_ordered: item.quantity_ordered,
            unit_price: item.unit_price,
            total_price: item.total_price,
          }))
        },
        termsConditions: data.termsConditions ? {
          create: {
            validity_days: data.termsConditions.validity_days,
            validity_words: data.termsConditions.validity_words,
            payment_grace_days: data.termsConditions.payment_grace_days,
            payment_words: data.termsConditions.payment_words,
            vat_percentage: data.termsConditions.vat_percentage || 18,
          }
        } : undefined,
      },
      include: {
        supplier: true,
        requester: true,
        currency: true,
        items: {
          include: {
            product: true,
          }
        },
        termsConditions: true,
      }
    });
  }

  async createApprovalSteps(poId: number, approvers: { userId: number; level: number }[]) {
    return await this.prisma.pOApproval.createMany({
      data: approvers.map(approver => ({
        po_id: poId,
        approver_id: approver.userId,
        level: approver.level,
        status: 'Pending',
      }))
    });
  }

  async getPaginatedPurchaseOrders(params: any) {
    const { page, limit, filter, userId, isAdmin } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (!isAdmin) {
      where.OR = [
        { requester_id: userId },
        { approvals: { some: { approver_id: userId } } }
      ];
    }

    if (filter?.status) {
      where.status = filter.status;
    }

    if (filter?.supplier_id) {
      where.supplier_id = filter.supplier_id;
    }

    if (filter?.requester_id) {
      where.requester_id = filter.requester_id;
    }

    if (filter?.date_from || filter?.date_to) {
      where.created_at = {};
      if (filter.date_from) {
        where.created_at.gte = new Date(filter.date_from);
      }
      if (filter.date_to) {
        where.created_at.lte = new Date(filter.date_to);
      }
    }

    if (filter?.search) {
      where.OR = [
        { po_number: { contains: filter.search } },
        { supplier: { supplier_name: { contains: filter.search } } },
        { remarks: { contains: filter.search } }
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        include: {
          supplier: {
            select: {
              supplier_id: true,
              supplier_name: true
            }
          },
          requester: {
            select: {
              userId: true,
              firstName: true,
              lastName: true
            }
          },
          currency: {
            select: {
              currency_code: true
            }
          },
          items: {
            select: {
              po_item_id: true,
              quantity_ordered: true,
              unit_price: true,
              total_price: true,
              status: true
            }
          },
          approvals: {
            select: {
              level: true,
              status: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      this.prisma.purchaseOrder.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getPurchaseOrderById(poId: number) {
    return await this.prisma.purchaseOrder.findUnique({
      where: { po_id: poId },
      include: {
        supplier: {
          select: {
            supplier_id: true,
            supplier_name: true,
            supplier_email: true,
            supplier_phone: true
          }
        },
        requester: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        currency: {
          select: {
            currency_id: true,
            currency_code: true,
            currency_name: true
          }
        },
        items: {
          select: {
            po_item_id: true,
            quantity_ordered: true,
            unit_price: true,
            total_price: true,
            received_qty: true,
            status: true,
            product: {
              select: {
                product_id: true,
                product_name: true
              }
            }
          }
        },
        approvals: {
          select: {
            approval_id: true,
            level: true,
            status: true,
            approved_at: true,
            approver_id: true,
            approver: {
              select: {
                userId: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { level: 'asc' }
        },
        termsConditions: true,
      }
    });
  }

  async updatePOStatus(poId: number, status: string, additionalData?: any) {
    return await this.prisma.purchaseOrder.update({
      where: { po_id: poId },
      data: {
        status,
        ...additionalData,
      }
    });
  }

  async updateApprovalStatus(approvalId: number, status: string, remarks?: string) {
    return await this.prisma.pOApproval.update({
      where: { approval_id: approvalId },
      data: {
        status,
        remarks,
        approved_at: status === 'Approved' ? new Date() : null,
      }
    });
  }

  async getPendingApprovalForUser(poId: number, userId: number) {
    return await this.prisma.pOApproval.findFirst({
      where: {
        po_id: poId,
        approver_id: userId,
        status: 'Pending',
      }
    });
  }

  async getAllApprovalsForPO(poId: number) {
    return await this.prisma.pOApproval.findMany({
      where: { po_id: poId },
      orderBy: { level: 'asc' }
    });
  }

  async generatePONumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const count = await this.prisma.purchaseOrder.count({
      where: {
        created_at: {
          gte: new Date(date.getFullYear(), date.getMonth(), 1),
          lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
        }
      }
    });

    const sequence = String(count + 1).padStart(3, '0');
    return `PO-${year}${month}-${sequence}`;
  }

  async savePODraft(userId: number, draftData: PurchaseOrderDraftData, draftType: 'manual' | 'auto' = 'manual') {
    return await this.prisma.purchaseOrderDraft.create({
      data: {
        creator_id: userId,
        draft_data: JSON.stringify(draftData),
        draft_type: draftType,
        supplier_id: draftData.supplier_id,
        total_amount: draftData.total_amount,
        expected_delivery: draftData.expected_delivery,
        remarks: draftData.remarks,
      }
    });
  }

  async getUserPODrafts(userId: number) {
    return await this.prisma.purchaseOrderDraft.findMany({
      where: {
        creator_id: userId,
        draft_type: 'manual',
      },
      include: {
        supplier: true,
      },
      orderBy: { updated_at: 'desc' }
    });
  }

  async deletePODraft(userId: number, draftId: number) {
    return await this.prisma.purchaseOrderDraft.deleteMany({
      where: {
        draft_id: draftId,
        creator_id: userId,
      }
    });
  }

  async deleteAllUserPODrafts(userId: number) {
    return await this.prisma.purchaseOrderDraft.deleteMany({
      where: {
        creator_id: userId,
        draft_type: 'manual',
      }
    });
  }

  async getLatestAutoDraft(userId: number) {
    return await this.prisma.purchaseOrderDraft.findFirst({
      where: {
        creator_id: userId,
        draft_type: 'auto',
      },
      orderBy: { updated_at: 'desc' }
    });
  }

  async deleteAutoDraft(userId: number) {
    return await this.prisma.purchaseOrderDraft.deleteMany({
      where: {
        creator_id: userId,
        draft_type: 'auto',
      }
    });
  }

  async countUserPODrafts(userId: number) {
    return await this.prisma.purchaseOrderDraft.count({
      where: {
        creator_id: userId,
        draft_type: 'manual',
      }
    });
  }

  async getUserByRole(roleId: number) {
    return await this.prisma.user.findFirst({
      where: { role_id: roleId }
    });
  }

  async getUserById(userId: number) {
    return await this.prisma.user.findUnique({
      where: { userId: userId },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        role_id: true
      }
    });
  }

  async getSinglePODraft(userId: number, draftId: number) {
    return await this.prisma.purchaseOrderDraft.findFirst({
      where: {
        draft_id: draftId,
        creator_id: userId,
      },
      include: {
        supplier: {
          select: {
            supplier_id: true,
            supplier_name: true
          }
        }
      }
    });
  }

  async cancelPendingApprovals(poId: number) {
    return await this.prisma.pOApproval.updateMany({
      where: {
        po_id: poId,
        status: 'Pending'
      },
      data: {
        status: 'Cancelled'
      }
    });
  }

  async updatePurchaseOrder(poId: number, data: any) {
    const totalAmount = data.items.reduce((sum: number, item: any) => sum + item.total_price, 0);
    
    return await this.prisma.purchaseOrder.update({
      where: { po_id: poId },
      data: {
        supplier_id: data.supplier_id,
        currency_id: data.currency_id,
        total_amount: totalAmount,
        expected_delivery: data.expected_delivery ? new Date(data.expected_delivery) : null,
        remarks: data.remarks,
        items: {
          deleteMany: {},
          create: data.items.map((item: any) => ({
            product_id: item.product_id,
            description: item.description,
            quantity_ordered: item.quantity_ordered,
            unit_price: item.unit_price,
            total_price: item.total_price,
          }))
        },
        termsConditions: data.termsConditions ? {
          deleteMany: {},
          create: {
            validity_days: data.termsConditions.validity_days,
            validity_words: data.termsConditions.validity_words,
            payment_grace_days: data.termsConditions.payment_grace_days,
            payment_words: data.termsConditions.payment_words,
            vat_percentage: data.termsConditions.vat_percentage || 18,
          }
        } : undefined,
      },
      select: {
        po_id: true,
        po_number: true,
        status: true,
        total_amount: true,
        expected_delivery: true,
        remarks: true,
        supplier: {
          select: {
            supplier_id: true,
            supplier_name: true
          }
        },
        currency: {
          select: {
            currency_code: true,
            currency_name: true
          }
        },
        items: {
          select: {
            po_item_id: true,
            quantity_ordered: true,
            unit_price: true,
            total_price: true,
            product: {
              select: {
                product_id: true,
                product_name: true
              }
            }
          }
        }
      }
    });
  }
}
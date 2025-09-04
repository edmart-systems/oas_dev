/*
  Warnings:

  - You are about to drop the `inv_order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_item` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `inv_order` DROP FOREIGN KEY `inv_order_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `inv_order` DROP FOREIGN KEY `inv_order_supplier_id_fkey`;

-- DropForeignKey
ALTER TABLE `inv_order` DROP FOREIGN KEY `inv_order_updated_by_fkey`;

-- DropForeignKey
ALTER TABLE `order_item` DROP FOREIGN KEY `order_item_order_id_fkey`;

-- DropForeignKey
ALTER TABLE `order_item` DROP FOREIGN KEY `order_item_product_id_fkey`;

-- AlterTable
ALTER TABLE `location` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `product` MODIFY `product_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `sale` MODIFY `sale_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `supplier` MODIFY `supplier_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `system_setting` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `inv_order`;

-- DropTable
DROP TABLE `order_item`;

-- CreateTable
CREATE TABLE `purchase_order` (
    `po_id` INTEGER NOT NULL AUTO_INCREMENT,
    `po_number` VARCHAR(24) NOT NULL,
    `supplier_id` INTEGER NOT NULL,
    `requester_id` INTEGER NOT NULL,
    `status` VARCHAR(24) NOT NULL DEFAULT 'Pending',
    `total_amount` DOUBLE NOT NULL DEFAULT 0,
    `currency_id` INTEGER NOT NULL,
    `expected_delivery` DATETIME(3) NULL,
    `issued_date` DATETIME(3) NULL,
    `approval_date` DATETIME(3) NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `purchase_order_po_number_key`(`po_number`),
    PRIMARY KEY (`po_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_order_item` (
    `po_item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `po_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `description` TEXT NULL,
    `quantity_ordered` DOUBLE NOT NULL,
    `unit_price` DOUBLE NOT NULL,
    `total_price` DOUBLE NOT NULL,
    `received_qty` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(24) NOT NULL DEFAULT 'Pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`po_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `po_approval` (
    `approval_id` INTEGER NOT NULL AUTO_INCREMENT,
    `po_id` INTEGER NOT NULL,
    `approver_id` INTEGER NOT NULL,
    `level` INTEGER NOT NULL,
    `status` VARCHAR(24) NOT NULL DEFAULT 'Pending',
    `remarks` TEXT NULL,
    `approved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`approval_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_order_draft` (
    `draft_id` INTEGER NOT NULL AUTO_INCREMENT,
    `creator_id` INTEGER NOT NULL,
    `draft_data` LONGTEXT NOT NULL,
    `draft_type` ENUM('manual', 'auto') NOT NULL DEFAULT 'manual',
    `supplier_id` INTEGER NULL,
    `total_amount` DOUBLE NULL DEFAULT 0,
    `currency` VARCHAR(8) NULL,
    `expected_delivery` DATETIME(3) NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_creator_draft_type`(`creator_id`, `draft_type`, `updated_at`),
    PRIMARY KEY (`draft_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_order_tcs` (
    `po_tc_id` INTEGER NOT NULL AUTO_INCREMENT,
    `po_id` INTEGER NOT NULL,
    `validity_days` INTEGER NOT NULL,
    `validity_words` VARCHAR(120) NULL,
    `payment_grace_days` INTEGER NULL,
    `payment_words` VARCHAR(160) NULL,
    `vat_percentage` INTEGER NOT NULL DEFAULT 18,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `purchase_order_tcs_po_id_fkey`(`po_id`),
    PRIMARY KEY (`po_tc_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `purchase_order` ADD CONSTRAINT `purchase_order_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency`(`currency_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order` ADD CONSTRAINT `purchase_order_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`supplier_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order` ADD CONSTRAINT `purchase_order_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `user`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order_item` ADD CONSTRAINT `purchase_order_item_po_id_fkey` FOREIGN KEY (`po_id`) REFERENCES `purchase_order`(`po_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order_item` ADD CONSTRAINT `purchase_order_item_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_approval` ADD CONSTRAINT `po_approval_po_id_fkey` FOREIGN KEY (`po_id`) REFERENCES `purchase_order`(`po_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `po_approval` ADD CONSTRAINT `po_approval_approver_id_fkey` FOREIGN KEY (`approver_id`) REFERENCES `user`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order_draft` ADD CONSTRAINT `purchase_order_draft_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `user`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order_draft` ADD CONSTRAINT `purchase_order_draft_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`supplier_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order_tcs` ADD CONSTRAINT `purchase_order_tcs_po_id_fkey` FOREIGN KEY (`po_id`) REFERENCES `purchase_order`(`po_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

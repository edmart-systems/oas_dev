/*
  Warnings:

  - You are about to alter the column `token` on the `password_reset` table. The data in that column could be lost. The data in that column will be cast from `VarChar(244)` to `VarChar(191)`.
  - You are about to alter the column `created_at` on the `quotation_draft` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updated_at` on the `quotation_draft` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.

*/
-- DropForeignKey
ALTER TABLE `quotation_draft` DROP FOREIGN KEY `quotation_draft_userId_fkey`;

-- AlterTable
ALTER TABLE `inventory_point` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `password_reset` MODIFY `token` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `product` MODIFY `product_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `quotation_draft` MODIFY `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `sale` MODIFY `sale_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `supplier` MODIFY `supplier_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `customer` (
    `customer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(120) NULL,
    `phone` VARCHAR(24) NULL,
    `address` VARCHAR(200) NULL,
    `status` VARCHAR(18) NOT NULL DEFAULT 'Active',
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `customer_email_key`(`email`),
    PRIMARY KEY (`customer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inv_order` (
    `order_id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_number` VARCHAR(24) NOT NULL,
    `supplier_id` INTEGER NOT NULL,
    `order_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `delivery_date` DATETIME(3) NULL,
    `status` VARCHAR(18) NOT NULL DEFAULT 'Pending',
    `items_count` INTEGER NOT NULL DEFAULT 0,
    `total_amount` INTEGER NOT NULL DEFAULT 0,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `inv_order_order_number_key`(`order_number`),
    PRIMARY KEY (`order_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_item` (
    `order_item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit_price` INTEGER NOT NULL,
    `total_price` INTEGER NOT NULL,

    PRIMARY KEY (`order_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_stock` (
    `inv_stock_id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `inventory_point_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`inv_stock_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transfer` (
    `transfer_id` INTEGER NOT NULL AUTO_INCREMENT,
    `from_inventory_point_id` INTEGER NOT NULL,
    `to_inventory_point_id` INTEGER NOT NULL,
    `note` VARCHAR(200) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`transfer_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transfer_item` (
    `transfer_item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `transfer_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,

    PRIMARY KEY (`transfer_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `quotation_draft` ADD CONSTRAINT `quotation_draft_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `customer` ADD CONSTRAINT `customer_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer` ADD CONSTRAINT `customer_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_order` ADD CONSTRAINT `inv_order_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`supplier_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_order` ADD CONSTRAINT `inv_order_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inv_order` ADD CONSTRAINT `inv_order_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `inv_order`(`order_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_item` ADD CONSTRAINT `order_item_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_stock` ADD CONSTRAINT `inventory_stock_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_stock` ADD CONSTRAINT `inventory_stock_inventory_point_id_fkey` FOREIGN KEY (`inventory_point_id`) REFERENCES `inventory_point`(`inventory_point_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer` ADD CONSTRAINT `transfer_from_inventory_point_id_fkey` FOREIGN KEY (`from_inventory_point_id`) REFERENCES `inventory_point`(`inventory_point_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer` ADD CONSTRAINT `transfer_to_inventory_point_id_fkey` FOREIGN KEY (`to_inventory_point_id`) REFERENCES `inventory_point`(`inventory_point_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer_item` ADD CONSTRAINT `transfer_item_transfer_id_fkey` FOREIGN KEY (`transfer_id`) REFERENCES `transfer`(`transfer_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer_item` ADD CONSTRAINT `transfer_item_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

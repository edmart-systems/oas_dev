-- AlterTable
ALTER TABLE `bank` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `company` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `company_address` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `currency` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `edited_quotation` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `quotation` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `quotation_tcs` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `role` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `status` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `sub_task` ADD COLUMN `deleted` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `push_count` INTEGER NOT NULL DEFAULT 0,
    MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `task` ADD COLUMN `archived` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `archived_at` DATETIME(3) NULL,
    ADD COLUMN `deleted` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `push_count` INTEGER NOT NULL DEFAULT 0,
    MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `unit` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user_signature` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `password_reset` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(244) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tag` (
    `tag_id` INTEGER NOT NULL AUTO_INCREMENT,
    `tag` VARCHAR(191) NOT NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tag_tag_key`(`tag`),
    PRIMARY KEY (`tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(191) NOT NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `category_category_key`(`category`),
    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier` (
    `supplier_id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplier_name` VARCHAR(191) NOT NULL,
    `supplier_email` VARCHAR(191) NULL,
    `supplier_phone` VARCHAR(191) NULL,
    `supplier_address` VARCHAR(191) NULL,
    `supplier_tinNumber` INTEGER NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,
    `supplier_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `supplier_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `supplier_supplier_name_key`(`supplier_name`),
    UNIQUE INDEX `supplier_supplier_email_key`(`supplier_email`),
    UNIQUE INDEX `supplier_supplier_tinNumber_key`(`supplier_tinNumber`),
    PRIMARY KEY (`supplier_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_point` (
    `inventory_point_id` INTEGER NOT NULL AUTO_INCREMENT,
    `inventory_point` VARCHAR(191) NOT NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `inventory_point_inventory_point_key`(`inventory_point`),
    PRIMARY KEY (`inventory_point_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product` (
    `product_id` INTEGER NOT NULL AUTO_INCREMENT,
    `supplier_id` INTEGER NULL,
    `product_name` VARCHAR(191) NOT NULL,
    `product_barcode` INTEGER NOT NULL,
    `product_description` VARCHAR(191) NOT NULL,
    `unit_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,
    `currency_id` INTEGER NOT NULL,
    `product_quantity` INTEGER NOT NULL DEFAULT 0,
    `product_max_quantity` INTEGER NULL DEFAULT 0,
    `product_min_quantity` INTEGER NULL DEFAULT 0,
    `product_status` INTEGER NULL DEFAULT 1,
    `buying_price` INTEGER NOT NULL DEFAULT 0,
    `selling_price` INTEGER NOT NULL DEFAULT 0,
    `markup_percentage` INTEGER NOT NULL DEFAULT 0,
    `vat_inclusive` INTEGER NOT NULL DEFAULT 0,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,
    `product_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `product_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `product_product_name_key`(`product_name`),
    UNIQUE INDEX `product_product_barcode_key`(`product_barcode`),
    PRIMARY KEY (`product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase` (
    `purchase_id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchase_quantity` INTEGER NOT NULL,
    `purchase_unit_cost` INTEGER NOT NULL,
    `purchase_total_cost` INTEGER NOT NULL,
    `purchase_created_by` VARCHAR(191) NULL,
    `purchase_updated_by` VARCHAR(191) NULL,
    `inventory_point_id` INTEGER NOT NULL DEFAULT 1,
    `supplier_id` INTEGER NOT NULL,
    `purchase_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `purchase_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`purchase_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_item` (
    `purchase_item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchase_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit_cost` INTEGER NOT NULL,
    `total_cost` INTEGER NOT NULL,

    PRIMARY KEY (`purchase_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock` (
    `stock_id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `inventory_point_id` INTEGER NOT NULL,
    `change_type` VARCHAR(191) NOT NULL,
    `quantity_change` INTEGER NOT NULL,
    `resulting_stock` INTEGER NOT NULL,
    `reference_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`stock_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sale` (
    `sale_id` INTEGER NOT NULL AUTO_INCREMENT,
    `sale_no` VARCHAR(12) NOT NULL,
    `seller_id` INTEGER NOT NULL,
    `sale_total_quantity` INTEGER NOT NULL DEFAULT 0,
    `sale_total_amount` INTEGER NOT NULL,
    `sale_total_discount` INTEGER NOT NULL DEFAULT 0,
    `sale_total_tax` INTEGER NOT NULL DEFAULT 0,
    `sale_grand_total` INTEGER NOT NULL DEFAULT 0,
    `currency_id` INTEGER NOT NULL,
    `inventory_point_id` INTEGER NOT NULL DEFAULT 1,
    `sale_status` INTEGER NOT NULL DEFAULT 1,
    `sale_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sale_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sale_sale_no_key`(`sale_no`),
    PRIMARY KEY (`sale_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sale_item` (
    `sale_item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `sale_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit_price` INTEGER NOT NULL,
    `total_price` INTEGER NOT NULL,
    `discount` INTEGER NOT NULL DEFAULT 0,
    `tax` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`sale_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `password_reset` ADD CONSTRAINT `password_reset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tag` ADD CONSTRAINT `tag_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tag` ADD CONSTRAINT `tag_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `category` ADD CONSTRAINT `category_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `category` ADD CONSTRAINT `category_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier` ADD CONSTRAINT `supplier_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier` ADD CONSTRAINT `supplier_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_point` ADD CONSTRAINT `inventory_point_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory_point` ADD CONSTRAINT `inventory_point_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_unit_id_fkey` FOREIGN KEY (`unit_id`) REFERENCES `unit`(`unit_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `tag`(`tag_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency`(`currency_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`supplier_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product` ADD CONSTRAINT `product_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase` ADD CONSTRAINT `purchase_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`supplier_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase` ADD CONSTRAINT `purchase_inventory_point_id_fkey` FOREIGN KEY (`inventory_point_id`) REFERENCES `inventory_point`(`inventory_point_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase` ADD CONSTRAINT `purchase_purchase_created_by_fkey` FOREIGN KEY (`purchase_created_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase` ADD CONSTRAINT `purchase_purchase_updated_by_fkey` FOREIGN KEY (`purchase_updated_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_item` ADD CONSTRAINT `purchase_item_purchase_id_fkey` FOREIGN KEY (`purchase_id`) REFERENCES `purchase`(`purchase_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_item` ADD CONSTRAINT `purchase_item_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock` ADD CONSTRAINT `stock_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock` ADD CONSTRAINT `stock_inventory_point_id_fkey` FOREIGN KEY (`inventory_point_id`) REFERENCES `inventory_point`(`inventory_point_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale` ADD CONSTRAINT `sale_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency`(`currency_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale` ADD CONSTRAINT `sale_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `user`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_item` ADD CONSTRAINT `sale_item_sale_id_fkey` FOREIGN KEY (`sale_id`) REFERENCES `sale`(`sale_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale_item` ADD CONSTRAINT `sale_item_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

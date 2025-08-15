-- Check if columns exist before adding them
-- For sub_task table
ALTER TABLE `sub_task` 
ADD COLUMN IF NOT EXISTS `deleted` INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS `push_count` INTEGER NOT NULL DEFAULT 0;

-- For task table  
ALTER TABLE `task` 
ADD COLUMN IF NOT EXISTS `archived` INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS `archived_at` DATETIME(3) NULL,
ADD COLUMN IF NOT EXISTS `deleted` INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS `push_count` INTEGER NOT NULL DEFAULT 0;

-- Update timestamp columns
ALTER TABLE `bank` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);
ALTER TABLE `company` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);
ALTER TABLE `company_address` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);
ALTER TABLE `currency` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);
ALTER TABLE `edited_quotation` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);
ALTER TABLE `quotation` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);
ALTER TABLE `quotation_tcs` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);
ALTER TABLE `role` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);
ALTER TABLE `status` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);
ALTER TABLE `sub_task` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);
ALTER TABLE `task` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);
ALTER TABLE `unit` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);
ALTER TABLE `user` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);
ALTER TABLE `user_signature` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- Create tables only if they don't exist
CREATE TABLE IF NOT EXISTS `password_reset` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(244) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `password_reset_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tag` (
    `tag_id` INTEGER NOT NULL AUTO_INCREMENT,
    `tag` VARCHAR(191) NOT NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `tag_tag_key`(`tag`),
    PRIMARY KEY (`tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `category` (
    `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(191) NOT NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `category_category_key`(`category`),
    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `supplier` (
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

CREATE TABLE IF NOT EXISTS `inventory_point` (
    `inventory_point_id` INTEGER NOT NULL AUTO_INCREMENT,
    `inventory_point` VARCHAR(191) NOT NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `inventory_point_inventory_point_key`(`inventory_point`),
    PRIMARY KEY (`inventory_point_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `product` (
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

CREATE TABLE IF NOT EXISTS `purchase` (
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

CREATE TABLE IF NOT EXISTS `purchase_item` (
    `purchase_item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchase_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit_cost` INTEGER NOT NULL,
    `total_cost` INTEGER NOT NULL,
    PRIMARY KEY (`purchase_item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stock` (
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

CREATE TABLE IF NOT EXISTS `sale` (
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

CREATE TABLE IF NOT EXISTS `sale_item` (
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
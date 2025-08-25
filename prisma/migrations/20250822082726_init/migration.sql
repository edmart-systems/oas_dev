-- CreateTable
CREATE TABLE `role` (
    `role_id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(24) NOT NULL,
    `role_desc` VARCHAR(160) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`role_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status` (
    `status_id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(24) NOT NULL,
    `status_desc` VARCHAR(160) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`status_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `co_user_id` VARCHAR(20) NOT NULL,
    `firstName` VARCHAR(24) NOT NULL,
    `lastName` VARCHAR(24) NOT NULL,
    `otherName` VARCHAR(24) NULL,
    `email` VARCHAR(64) NOT NULL,
    `email_verified` INTEGER NOT NULL DEFAULT 0,
    `phone_number` VARCHAR(16) NOT NULL,
    `phone_verified` INTEGER NOT NULL DEFAULT 0,
    `hash` VARCHAR(244) NOT NULL,
    `profile_picture` VARCHAR(120) NULL,
    `status_id` INTEGER NOT NULL,
    `status_reason` VARCHAR(260) NULL,
    `role_id` INTEGER NOT NULL,
    `signed` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_co_user_id_key`(`co_user_id`),
    UNIQUE INDEX `user_email_key`(`email`),
    UNIQUE INDEX `user_phone_number_key`(`phone_number`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
CREATE TABLE `user_signature` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `co_user_id` VARCHAR(191) NOT NULL,
    `canUpdate` INTEGER NOT NULL DEFAULT 0,
    `dataUrl` LONGTEXT NOT NULL,
    `height` INTEGER NOT NULL DEFAULT 30,
    `width` INTEGER NOT NULL DEFAULT 120,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_signature_co_user_id_key`(`co_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `currency` (
    `currency_id` INTEGER NOT NULL AUTO_INCREMENT,
    `currency_code` VARCHAR(6) NOT NULL,
    `currency_name` VARCHAR(24) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`currency_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unit` (
    `unit_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(160) NOT NULL,
    `short_name` VARCHAR(160) NULL,
    `unit_desc` VARCHAR(160) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`unit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company` (
    `co_id` INTEGER NOT NULL AUTO_INCREMENT,
    `legal_name` VARCHAR(64) NULL,
    `business_name` VARCHAR(64) NOT NULL,
    `tin` VARCHAR(191) NULL,
    `email` VARCHAR(64) NOT NULL,
    `phone_number_1` VARCHAR(16) NOT NULL,
    `phone_number_2` VARCHAR(16) NULL,
    `landline_number` VARCHAR(16) NULL,
    `logo` VARCHAR(120) NULL,
    `web` VARCHAR(120) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`co_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_address` (
    `co_ad_id` INTEGER NOT NULL AUTO_INCREMENT,
    `co_id` INTEGER NOT NULL,
    `branch_number` VARCHAR(20) NULL,
    `branch_name` VARCHAR(20) NULL,
    `box_number` VARCHAR(20) NULL,
    `street` VARCHAR(60) NULL,
    `plot_number` VARCHAR(20) NULL,
    `building_name` VARCHAR(20) NULL,
    `floor_number` INTEGER NOT NULL,
    `room_number` VARCHAR(20) NOT NULL,
    `country` VARCHAR(20) NOT NULL DEFAULT 'Uganda',
    `district` VARCHAR(20) NOT NULL,
    `county` VARCHAR(20) NOT NULL,
    `subcounty` VARCHAR(20) NOT NULL,
    `village` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`co_ad_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank` (
    `bank_id` INTEGER NOT NULL AUTO_INCREMENT,
    `co_id` INTEGER NOT NULL,
    `name` VARCHAR(60) NOT NULL,
    `branch_name` VARCHAR(60) NOT NULL,
    `swift_code` VARCHAR(60) NULL,
    `ac_title` VARCHAR(60) NOT NULL,
    `ac_number` VARCHAR(60) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`bank_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_type` (
    `type_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(60) NOT NULL,

    PRIMARY KEY (`type_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_category` (
    `cat_id` INTEGER NOT NULL AUTO_INCREMENT,
    `cat` VARCHAR(60) NOT NULL,

    PRIMARY KEY (`cat_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_tcs` (
    `tc_id` INTEGER NOT NULL AUTO_INCREMENT,
    `delivery_days` INTEGER NOT NULL,
    `delivery_words` VARCHAR(120) NOT NULL,
    `validity_days` INTEGER NOT NULL,
    `validity_words` VARCHAR(120) NULL,
    `payment_grace_days` INTEGER NULL,
    `payment_words` VARCHAR(160) NULL,
    `initial_payment_percentage` INTEGER NULL,
    `last_payment_percentage` INTEGER NULL,
    `payment_method_words` VARCHAR(160) NULL,
    `quotation_type_id` INTEGER NOT NULL,
    `bank_id` INTEGER NOT NULL,
    `vat_percentage` INTEGER NOT NULL DEFAULT 18,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`tc_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_status` (
    `status_id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(12) NOT NULL,

    PRIMARY KEY (`status_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quotation_id` VARCHAR(12) NOT NULL,
    `status_id` INTEGER NOT NULL DEFAULT 1,
    `co_user_id` VARCHAR(20) NOT NULL,
    `time` BIGINT NOT NULL,
    `quotation_type_id` INTEGER NOT NULL,
    `cat_id` INTEGER NOT NULL,
    `tcs_edited` INTEGER NOT NULL DEFAULT 0,
    `vat_excluded` INTEGER NOT NULL DEFAULT 0,
    `tcs_id` INTEGER NOT NULL,
    `currency_id` INTEGER NOT NULL,
    `client_data_id` INTEGER NOT NULL,
    `sub_total` DOUBLE NOT NULL,
    `vat` DOUBLE NOT NULL,
    `grand_total` DOUBLE NOT NULL,
    `validity_days` INTEGER NOT NULL,
    `payment_grace_days` INTEGER NULL,
    `initial_payment_percentage` INTEGER NULL,
    `last_payment_percentage` INTEGER NULL,
    `edited` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `quotation_quotation_id_key`(`quotation_id`),
    INDEX `idx_quotation_quotation_id`(`quotation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `edited_quotation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quotation_id` VARCHAR(12) NOT NULL,
    `status_id` INTEGER NOT NULL DEFAULT 1,
    `co_user_id` VARCHAR(20) NOT NULL,
    `time` BIGINT NOT NULL,
    `created_time` BIGINT NOT NULL,
    `quotation_type_id` INTEGER NOT NULL,
    `cat_id` INTEGER NOT NULL,
    `tcs_edited` INTEGER NOT NULL DEFAULT 0,
    `vat_excluded` INTEGER NOT NULL DEFAULT 0,
    `tcs_id` INTEGER NOT NULL,
    `currency_id` INTEGER NOT NULL,
    `client_data_id` INTEGER NOT NULL,
    `sub_total` DOUBLE NOT NULL,
    `vat` DOUBLE NOT NULL,
    `grand_total` DOUBLE NOT NULL,
    `validity_days` INTEGER NOT NULL,
    `payment_grace_days` INTEGER NULL,
    `initial_payment_percentage` INTEGER NULL,
    `last_payment_percentage` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_client_data` (
    `client_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `external_ref` VARCHAR(191) NULL,
    `contact_person` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `box_number` INTEGER NULL,
    `country` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `address_Line_1` VARCHAR(191) NULL,

    PRIMARY KEY (`client_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_items` (
    `item_id` INTEGER NOT NULL AUTO_INCREMENT,
    `quot_id` INTEGER NULL,
    `edited_quot_id` INTEGER NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NULL,
    `quantity` DOUBLE NOT NULL,
    `units` VARCHAR(191) NOT NULL,
    `unitPrice` DOUBLE NOT NULL,

    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_tagged_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `main_quotation_id` VARCHAR(12) NULL,
    `edited_quotation_id` INTEGER NULL,
    `taggedUsers` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotation_draft` (
    `id` BIGINT NOT NULL,
    `userId` INTEGER NOT NULL,
    `draft` LONGTEXT NOT NULL,
    `draft_type` ENUM('manual', 'auto') NOT NULL DEFAULT 'manual',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    INDEX `idx_user_draft_type`(`userId`, `draft_type`, `updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_type` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_template` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `template` VARCHAR(380) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type_id` INTEGER NOT NULL,
    `time` BIGINT NOT NULL,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `template_id` INTEGER NULL,
    `isRead` INTEGER NOT NULL DEFAULT 0,
    `deleted` INTEGER NOT NULL DEFAULT 0,
    `action_data` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_priority` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `priority` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(18) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task` (
    `taskId` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `statusId` INTEGER NOT NULL DEFAULT 1,
    `priorityId` INTEGER NOT NULL DEFAULT 2,
    `taskName` TEXT NOT NULL,
    `taskDetails` LONGTEXT NULL,
    `comments` LONGTEXT NULL,
    `time` BIGINT NOT NULL,
    `startTime` BIGINT NOT NULL,
    `endTime` BIGINT NULL,
    `taskLocked` INTEGER NOT NULL DEFAULT 0,
    `deleted` INTEGER NOT NULL DEFAULT 0,
    `push_count` INTEGER NOT NULL DEFAULT 0,
    `archived` INTEGER NOT NULL DEFAULT 0,
    `archived_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`taskId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_task` (
    `subTaskId` INTEGER NOT NULL AUTO_INCREMENT,
    `taskId` INTEGER NOT NULL,
    `statusId` INTEGER NOT NULL DEFAULT 1,
    `priorityId` INTEGER NULL DEFAULT 2,
    `taskName` TEXT NOT NULL,
    `taskDetails` LONGTEXT NULL,
    `comments` LONGTEXT NOT NULL,
    `time` BIGINT NOT NULL,
    `startTime` BIGINT NULL,
    `endTime` BIGINT NULL,
    `deleted` INTEGER NOT NULL DEFAULT 0,
    `push_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`subTaskId`)
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
ALTER TABLE `user` ADD CONSTRAINT `user_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `status`(`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset` ADD CONSTRAINT `password_reset_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_signature` ADD CONSTRAINT `user_signature_co_user_id_fkey` FOREIGN KEY (`co_user_id`) REFERENCES `user`(`co_user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_address` ADD CONSTRAINT `company_address_co_id_fkey` FOREIGN KEY (`co_id`) REFERENCES `company`(`co_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bank` ADD CONSTRAINT `bank_co_id_fkey` FOREIGN KEY (`co_id`) REFERENCES `company`(`co_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_tcs` ADD CONSTRAINT `quotation_tcs_quotation_type_id_fkey` FOREIGN KEY (`quotation_type_id`) REFERENCES `quotation_type`(`type_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_tcs` ADD CONSTRAINT `quotation_tcs_bank_id_fkey` FOREIGN KEY (`bank_id`) REFERENCES `bank`(`bank_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation` ADD CONSTRAINT `quotation_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `quotation_status`(`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation` ADD CONSTRAINT `quotation_quotation_type_id_fkey` FOREIGN KEY (`quotation_type_id`) REFERENCES `quotation_type`(`type_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation` ADD CONSTRAINT `quotation_cat_id_fkey` FOREIGN KEY (`cat_id`) REFERENCES `quotation_category`(`cat_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation` ADD CONSTRAINT `quotation_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency`(`currency_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation` ADD CONSTRAINT `quotation_co_user_id_fkey` FOREIGN KEY (`co_user_id`) REFERENCES `user`(`co_user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation` ADD CONSTRAINT `quotation_client_data_id_fkey` FOREIGN KEY (`client_data_id`) REFERENCES `quotation_client_data`(`client_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation` ADD CONSTRAINT `quotation_tcs_id_fkey` FOREIGN KEY (`tcs_id`) REFERENCES `quotation_tcs`(`tc_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edited_quotation` ADD CONSTRAINT `edited_quotation_quotation_id_fkey` FOREIGN KEY (`quotation_id`) REFERENCES `quotation`(`quotation_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edited_quotation` ADD CONSTRAINT `edited_quotation_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `quotation_status`(`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edited_quotation` ADD CONSTRAINT `edited_quotation_quotation_type_id_fkey` FOREIGN KEY (`quotation_type_id`) REFERENCES `quotation_type`(`type_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edited_quotation` ADD CONSTRAINT `edited_quotation_cat_id_fkey` FOREIGN KEY (`cat_id`) REFERENCES `quotation_category`(`cat_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edited_quotation` ADD CONSTRAINT `edited_quotation_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currency`(`currency_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edited_quotation` ADD CONSTRAINT `edited_quotation_co_user_id_fkey` FOREIGN KEY (`co_user_id`) REFERENCES `user`(`co_user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edited_quotation` ADD CONSTRAINT `edited_quotation_client_data_id_fkey` FOREIGN KEY (`client_data_id`) REFERENCES `quotation_client_data`(`client_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `edited_quotation` ADD CONSTRAINT `edited_quotation_tcs_id_fkey` FOREIGN KEY (`tcs_id`) REFERENCES `quotation_tcs`(`tc_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_items` ADD CONSTRAINT `quotation_items_quot_id_fkey` FOREIGN KEY (`quot_id`) REFERENCES `quotation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_items` ADD CONSTRAINT `quotation_items_edited_quot_id_fkey` FOREIGN KEY (`edited_quot_id`) REFERENCES `edited_quotation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_tagged_users` ADD CONSTRAINT `quotation_tagged_users_main_quotation_id_fkey` FOREIGN KEY (`main_quotation_id`) REFERENCES `quotation`(`quotation_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_tagged_users` ADD CONSTRAINT `quotation_tagged_users_edited_quotation_id_fkey` FOREIGN KEY (`edited_quotation_id`) REFERENCES `edited_quotation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotation_draft` ADD CONSTRAINT `quotation_draft_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_type_id_fkey` FOREIGN KEY (`type_id`) REFERENCES `notification_type`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `notification_template`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `task_status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task` ADD CONSTRAINT `task_priorityId_fkey` FOREIGN KEY (`priorityId`) REFERENCES `task_priority`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_task` ADD CONSTRAINT `sub_task_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `task`(`taskId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_task` ADD CONSTRAINT `sub_task_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `task_status`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_task` ADD CONSTRAINT `sub_task_priorityId_fkey` FOREIGN KEY (`priorityId`) REFERENCES `task_priority`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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

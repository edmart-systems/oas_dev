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
CREATE TABLE `user_signature` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `co_user_id` VARCHAR(191) NOT NULL,
    `canUpdate` INTEGER NOT NULL DEFAULT 0,
    `dataUrl` LONGTEXT NOT NULL,
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
    `name` VARCHAR(24) NOT NULL,
    `short_name` VARCHAR(10) NULL,
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
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `quotation_quotation_id_key`(`quotation_id`),
    INDEX `idx_quotation_quotation_id`(`quotation_id`),
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
    `quot_id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `quantity` DOUBLE NOT NULL,
    `units` VARCHAR(191) NOT NULL,
    `unitPrice` DOUBLE NOT NULL,

    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `role`(`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `status`(`status_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE `quotation_items` ADD CONSTRAINT `quotation_items_quot_id_fkey` FOREIGN KEY (`quot_id`) REFERENCES `quotation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

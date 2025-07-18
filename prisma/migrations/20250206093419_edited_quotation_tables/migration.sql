-- DropForeignKey
ALTER TABLE `quotation_items` DROP FOREIGN KEY `quotation_items_quot_id_fkey`;

-- AlterTable
ALTER TABLE `quotation` ADD COLUMN `edited` INTEGER NOT NULL DEFAULT 0 AFTER `last_payment_percentage`;

-- AlterTable
ALTER TABLE `quotation_items` ADD COLUMN `edited_quot_id` INTEGER NULL AFTER `quot_id`,
    MODIFY `quot_id` INTEGER NULL;

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

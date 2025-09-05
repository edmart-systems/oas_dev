/*
  Warnings:

  - A unique constraint covering the columns `[product_id,location_id]` on the table `location_stock` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `location` ADD COLUMN `assigned_to` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `product` MODIFY `product_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `sale` MODIFY `sale_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `supplier` MODIFY `supplier_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `system_setting` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `transfer` ADD COLUMN `assigned_user_id` INTEGER NULL,
    ADD COLUMN `created_by` VARCHAR(191) NULL,
    ADD COLUMN `signature_data` LONGTEXT NULL,
    ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `user` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `location_stock_product_id_location_id_key` ON `location_stock`(`product_id`, `location_id`);

-- AddForeignKey
ALTER TABLE `location` ADD CONSTRAINT `location_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer` ADD CONSTRAINT `transfer_assigned_user_id_fkey` FOREIGN KEY (`assigned_user_id`) REFERENCES `user`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer` ADD CONSTRAINT `transfer_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

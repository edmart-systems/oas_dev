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
ALTER TABLE `sub_task` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `task` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `unit` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user_signature` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `Purchase` (
    `purchase_id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchase_quantity` INTEGER NOT NULL,
    `purchase_unit_cost` INTEGER NOT NULL,
    `purchase_total_cost` INTEGER NOT NULL,
    `purchase_created_by` VARCHAR(191) NULL,
    `purchase_updated_by` VARCHAR(191) NULL,
    `inventory_point_id` INTEGER NOT NULL DEFAULT 1,
    `supplier_id` INTEGER NOT NULL,
    `purchase_created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `purchase_updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`purchase_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `Supplier`(`supplier_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_inventory_point_id_fkey` FOREIGN KEY (`inventory_point_id`) REFERENCES `Inventory_point`(`inventory_point_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

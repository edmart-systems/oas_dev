/*
  Warnings:

  - You are about to drop the column `inventory_point_id` on the `product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_inventory_point_id_fkey`;

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
ALTER TABLE `product` DROP COLUMN `inventory_point_id`,
    ADD COLUMN `markup_percentage` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `product_max_quantity` INTEGER NULL DEFAULT 0,
    ADD COLUMN `product_min_quantity` INTEGER NULL DEFAULT 0,
    MODIFY `buying_price` INTEGER NOT NULL DEFAULT 0,
    MODIFY `selling_price` INTEGER NOT NULL DEFAULT 0,
    MODIFY `product_status` INTEGER NULL DEFAULT 1;

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

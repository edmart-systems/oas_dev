/*
  Warnings:

  - You are about to drop the column `currency_id` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `product_max_quantity` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `product_min_quantity` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `product_quantity` on the `product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sku_code]` on the table `product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `product_currency_id_fkey`;

-- AlterTable
ALTER TABLE `inventory_point` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `product` DROP COLUMN `currency_id`,
    DROP COLUMN `product_max_quantity`,
    DROP COLUMN `product_min_quantity`,
    DROP COLUMN `product_quantity`,
    ADD COLUMN `reorder_level` INTEGER NULL DEFAULT 0,
    ADD COLUMN `sku_code` VARCHAR(191) NULL,
    ADD COLUMN `stock_quantity` INTEGER NOT NULL DEFAULT 0,
    MODIFY `product_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `sale` MODIFY `sale_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `supplier` MODIFY `supplier_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `product_sku_code_key` ON `product`(`sku_code`);

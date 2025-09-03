/*
  Warnings:

  - You are about to drop the column `inventory_point_id` on the `purchase` table. All the data in the column will be lost.
  - You are about to drop the column `inventory_point_id` on the `sale` table. All the data in the column will be lost.
  - You are about to drop the column `inventory_point_id` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `from_inventory_point_id` on the `transfer` table. All the data in the column will be lost.
  - You are about to drop the column `to_inventory_point_id` on the `transfer` table. All the data in the column will be lost.
  - You are about to drop the `inventory_point` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inventory_stock` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `location_id` to the `purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location_id` to the `sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location_id` to the `stock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `from_location_id` to the `transfer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to_location_id` to the `transfer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `inventory_point` DROP FOREIGN KEY `inventory_point_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_point` DROP FOREIGN KEY `inventory_point_updated_by_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_stock` DROP FOREIGN KEY `inventory_stock_inventory_point_id_fkey`;

-- DropForeignKey
ALTER TABLE `inventory_stock` DROP FOREIGN KEY `inventory_stock_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `purchase` DROP FOREIGN KEY `purchase_inventory_point_id_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `stock_inventory_point_id_fkey`;

-- DropForeignKey
ALTER TABLE `transfer` DROP FOREIGN KEY `transfer_from_inventory_point_id_fkey`;

-- DropForeignKey
ALTER TABLE `transfer` DROP FOREIGN KEY `transfer_to_inventory_point_id_fkey`;

-- AlterTable
ALTER TABLE `product` MODIFY `product_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `purchase` DROP COLUMN `inventory_point_id`,
    ADD COLUMN `location_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `sale` DROP COLUMN `inventory_point_id`,
    ADD COLUMN `location_id` INTEGER NOT NULL,
    MODIFY `sale_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `stock` DROP COLUMN `inventory_point_id`,
    ADD COLUMN `location_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `supplier` MODIFY `supplier_updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `transfer` DROP COLUMN `from_inventory_point_id`,
    DROP COLUMN `to_inventory_point_id`,
    ADD COLUMN `from_location_id` INTEGER NOT NULL,
    ADD COLUMN `to_location_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `inventory_point`;

-- DropTable
DROP TABLE `inventory_stock`;

-- CreateTable
CREATE TABLE `location` (
    `location_id` INTEGER NOT NULL AUTO_INCREMENT,
    `location_name` VARCHAR(191) NOT NULL,
    `location_type` ENUM('MAIN_STORE', 'BRANCH', 'INVENTORY_POINT') NOT NULL,
    `location_parent_id` INTEGER NULL,
    `location_address` VARCHAR(191) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `location_location_name_key`(`location_name`),
    PRIMARY KEY (`location_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location_stock` (
    `location_stock_id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `location_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`location_stock_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `location` ADD CONSTRAINT `location_location_parent_id_fkey` FOREIGN KEY (`location_parent_id`) REFERENCES `location`(`location_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `location` ADD CONSTRAINT `location_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `location` ADD CONSTRAINT `location_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `user`(`co_user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase` ADD CONSTRAINT `purchase_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`location_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock` ADD CONSTRAINT `stock_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`location_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sale` ADD CONSTRAINT `sale_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`location_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `location_stock` ADD CONSTRAINT `location_stock_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `location_stock` ADD CONSTRAINT `location_stock_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `location`(`location_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer` ADD CONSTRAINT `transfer_from_location_id_fkey` FOREIGN KEY (`from_location_id`) REFERENCES `location`(`location_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transfer` ADD CONSTRAINT `transfer_to_location_id_fkey` FOREIGN KEY (`to_location_id`) REFERENCES `location`(`location_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

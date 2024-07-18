/*
  Warnings:

  - You are about to drop the column `table` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `table_id` on the `addresses` table. All the data in the column will be lost.
  - Added the required column `sector_id` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `addresses` DROP COLUMN `table`,
    DROP COLUMN `table_id`,
    ADD COLUMN `sector_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_sector_id_fkey` FOREIGN KEY (`sector_id`) REFERENCES `sectors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

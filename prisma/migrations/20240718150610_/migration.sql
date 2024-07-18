/*
  Warnings:

  - Added the required column `table` to the `addresses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `table_id` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `addresses` ADD COLUMN `table` VARCHAR(191) NOT NULL,
    ADD COLUMN `table_id` VARCHAR(191) NOT NULL;

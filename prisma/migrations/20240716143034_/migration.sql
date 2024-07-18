/*
  Warnings:

  - You are about to alter the column `code` on the `products` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `code` on the `roles` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - Added the required column `price` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products` ADD COLUMN `price` DOUBLE NOT NULL,
    MODIFY `code` INTEGER NOT NULL AUTO_INCREMENT;

-- AlterTable
ALTER TABLE `roles` MODIFY `code` INTEGER NOT NULL AUTO_INCREMENT;

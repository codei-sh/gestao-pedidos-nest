-- DropForeignKey
ALTER TABLE `addresses` DROP FOREIGN KEY `addresses_sector_id_fkey`;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_sector_id_fkey` FOREIGN KEY (`sector_id`) REFERENCES `sectors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

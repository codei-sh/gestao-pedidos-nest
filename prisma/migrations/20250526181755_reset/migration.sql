-- CreateTable
CREATE TABLE `Files` (
    `id` VARCHAR(191) NOT NULL,
    `code` INTEGER NOT NULL AUTO_INCREMENT,
    `file` VARCHAR(191) NOT NULL,
    `table` VARCHAR(191) NOT NULL,
    `table_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Files_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- RedefineIndex
CREATE UNIQUE INDEX `code` ON `orders`(`code`);
DROP INDEX `orders_code_key` ON `orders`;

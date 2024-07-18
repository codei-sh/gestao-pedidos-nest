-- CreateTable
CREATE TABLE `clients` (
    `id` VARCHAR(191) NOT NULL,
    `code` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `clients_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` VARCHAR(191) NOT NULL,
    `code` INTEGER NOT NULL AUTO_INCREMENT,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `zip_code` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL,
    `complement` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `table` VARCHAR(191) NOT NULL,
    `table_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `addresses_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `type_phones` (
    `id` VARCHAR(191) NOT NULL,
    `code` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `type_phones_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phones` (
    `id` VARCHAR(191) NOT NULL,
    `code` INTEGER NOT NULL AUTO_INCREMENT,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `phone` VARCHAR(191) NOT NULL,
    `type_phone_id` VARCHAR(191) NOT NULL,
    `table` VARCHAR(191) NOT NULL,
    `table_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `phones_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `phones` ADD CONSTRAINT `phones_type_phone_id_fkey` FOREIGN KEY (`type_phone_id`) REFERENCES `type_phones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

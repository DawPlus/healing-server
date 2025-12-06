-- CreateTable
CREATE TABLE `page5_documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page1_id` INTEGER NOT NULL,
    `document_type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `organization_name` VARCHAR(191) NOT NULL,
    `contact_name` VARCHAR(191) NULL,
    `contact_email` VARCHAR(191) NULL,
    `contact_phone` VARCHAR(191) NULL,
    `reservation_date` DATETIME(3) NULL,
    `reservation_code` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `page5_documents_page1_id_idx`(`page1_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `page5_documents` ADD CONSTRAINT `page5_documents_page1_id_fkey` FOREIGN KEY (`page1_id`) REFERENCES `Page1`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

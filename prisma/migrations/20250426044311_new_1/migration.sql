-- CreateTable
CREATE TABLE `page_final` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `page1_id` INTEGER NOT NULL,
    `program_area1` INTEGER NULL DEFAULT 0,
    `program_area1_note` VARCHAR(191) NULL,
    `program_area2` INTEGER NULL DEFAULT 0,
    `program_area2_note` VARCHAR(191) NULL,
    `program_area3` INTEGER NULL DEFAULT 0,
    `program_area3_note` VARCHAR(191) NULL,
    `environment_area1` INTEGER NULL DEFAULT 0,
    `environment_area1_note` VARCHAR(191) NULL,
    `environment_area2` INTEGER NULL DEFAULT 0,
    `environment_area2_note` VARCHAR(191) NULL,
    `environment_area3` INTEGER NULL DEFAULT 0,
    `environment_area3_note` VARCHAR(191) NULL,
    `forest_usage1` INTEGER NULL DEFAULT 0,
    `forest_usage1_note` VARCHAR(191) NULL,
    `forest_usage2` INTEGER NULL DEFAULT 0,
    `forest_usage2_note` VARCHAR(191) NULL,
    `forest_usage3` INTEGER NULL DEFAULT 0,
    `forest_usage3_note` VARCHAR(191) NULL,
    `facility_area1` INTEGER NULL DEFAULT 0,
    `facility_area1_note` VARCHAR(191) NULL,
    `facility_area2` INTEGER NULL DEFAULT 0,
    `facility_area2_note` VARCHAR(191) NULL,
    `facility_area3` INTEGER NULL DEFAULT 0,
    `facility_area3_note` VARCHAR(191) NULL,
    `suggestion_area1` INTEGER NULL DEFAULT 0,
    `suggestion_area1_note` VARCHAR(191) NULL,
    `complaint` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `page_final_page1_id_key`(`page1_id`),
    INDEX `page_final_page1_id_idx`(`page1_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `page_final` ADD CONSTRAINT `page_final_page1_id_fkey` FOREIGN KEY (`page1_id`) REFERENCES `Page1`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

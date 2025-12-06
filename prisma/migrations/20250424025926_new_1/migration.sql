-- CreateTable
CREATE TABLE `counsel_therapy_forms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `agency` VARCHAR(191) NOT NULL,
    `openday` VARCHAR(191) NOT NULL,
    `eval_date` VARCHAR(191) NOT NULL,
    `ptcprogram` VARCHAR(191) NULL,
    `counsel_contents` TEXT NULL,
    `session1` VARCHAR(191) NULL,
    `session2` VARCHAR(191) NULL,
    `pv` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `counsel_therapy_form_entries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `counsel_therapy_form_id` INTEGER NOT NULL,
    `counsel_therapy_seq` INTEGER NULL,
    `sex` VARCHAR(191) NULL,
    `age` VARCHAR(191) NULL,
    `residence` VARCHAR(191) NULL,
    `job` VARCHAR(191) NULL,
    `past_experience` VARCHAR(191) NULL,
    `score1` VARCHAR(191) NULL,
    `score2` VARCHAR(191) NULL,
    `score3` VARCHAR(191) NULL,
    `score4` VARCHAR(191) NULL,
    `score5` VARCHAR(191) NULL,
    `score6` VARCHAR(191) NULL,
    `score7` VARCHAR(191) NULL,
    `score8` VARCHAR(191) NULL,
    `score9` VARCHAR(191) NULL,
    `score10` VARCHAR(191) NULL,
    `score11` VARCHAR(191) NULL,
    `score12` VARCHAR(191) NULL,
    `score13` VARCHAR(191) NULL,
    `score14` VARCHAR(191) NULL,
    `score15` VARCHAR(191) NULL,
    `score16` VARCHAR(191) NULL,
    `score17` VARCHAR(191) NULL,
    `score18` VARCHAR(191) NULL,
    `score19` VARCHAR(191) NULL,
    `score20` VARCHAR(191) NULL,
    `score21` VARCHAR(191) NULL,
    `score22` VARCHAR(191) NULL,
    `score23` VARCHAR(191) NULL,
    `score24` VARCHAR(191) NULL,
    `score25` VARCHAR(191) NULL,
    `score26` VARCHAR(191) NULL,
    `score27` VARCHAR(191) NULL,
    `score28` VARCHAR(191) NULL,
    `score29` VARCHAR(191) NULL,
    `score30` VARCHAR(191) NULL,
    `score31` VARCHAR(191) NULL,
    `score32` VARCHAR(191) NULL,
    `score33` VARCHAR(191) NULL,
    `score34` VARCHAR(191) NULL,
    `score35` VARCHAR(191) NULL,
    `score36` VARCHAR(191) NULL,
    `score37` VARCHAR(191) NULL,
    `score38` VARCHAR(191) NULL,
    `score39` VARCHAR(191) NULL,
    `score40` VARCHAR(191) NULL,
    `score41` VARCHAR(191) NULL,
    `score42` VARCHAR(191) NULL,
    `score43` VARCHAR(191) NULL,
    `score44` VARCHAR(191) NULL,
    `score45` VARCHAR(191) NULL,
    `score46` VARCHAR(191) NULL,
    `score47` VARCHAR(191) NULL,
    `score48` VARCHAR(191) NULL,
    `score49` VARCHAR(191) NULL,
    `score50` VARCHAR(191) NULL,
    `score51` VARCHAR(191) NULL,
    `score52` VARCHAR(191) NULL,
    `score53` VARCHAR(191) NULL,
    `score54` VARCHAR(191) NULL,
    `score55` VARCHAR(191) NULL,
    `score56` VARCHAR(191) NULL,
    `score57` VARCHAR(191) NULL,
    `score58` VARCHAR(191) NULL,
    `score59` VARCHAR(191) NULL,
    `score60` VARCHAR(191) NULL,
    `score61` VARCHAR(191) NULL,
    `score62` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `counsel_therapy_form_entries_counsel_therapy_form_id_idx`(`counsel_therapy_form_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgramSchedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reservation_id` INTEGER NOT NULL,
    `group_name` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScheduleProgram` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `schedule_id` INTEGER NOT NULL,
    `day` INTEGER NOT NULL,
    `time_slot` VARCHAR(191) NOT NULL,
    `program_name` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `instructor` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_name` VARCHAR(191) NOT NULL,
    `room_type` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `floor` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomAssignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reservation_id` INTEGER NOT NULL,
    `room_id` INTEGER NOT NULL,
    `room_name` VARCHAR(191) NOT NULL,
    `floor` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `organization` VARCHAR(191) NOT NULL,
    `occupancy` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RoomAssignment_room_id_date_key`(`room_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `counsel_therapy_form_entries` ADD CONSTRAINT `counsel_therapy_form_entries_counsel_therapy_form_id_fkey` FOREIGN KEY (`counsel_therapy_form_id`) REFERENCES `counsel_therapy_forms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleProgram` ADD CONSTRAINT `ScheduleProgram_schedule_id_fkey` FOREIGN KEY (`schedule_id`) REFERENCES `ProgramSchedule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomAssignment` ADD CONSTRAINT `RoomAssignment_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

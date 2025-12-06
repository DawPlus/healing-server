/*
  Warnings:

  - You are about to drop the `counsel_form_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `counsel_forms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `counsel_therapy_form_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `healing_form_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hrv_form_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `prevent_form_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `program_form_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `service_form_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vibra_form_entries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `counsel_form_entries` DROP FOREIGN KEY `counsel_form_entries_counsel_form_id_fkey`;

-- DropForeignKey
ALTER TABLE `counsel_therapy_form_entries` DROP FOREIGN KEY `counsel_therapy_form_entries_counsel_therapy_form_id_fkey`;

-- DropForeignKey
ALTER TABLE `healing_form_entries` DROP FOREIGN KEY `healing_form_entries_healing_form_id_fkey`;

-- DropForeignKey
ALTER TABLE `hrv_form_entries` DROP FOREIGN KEY `hrv_form_entries_hrv_form_id_fkey`;

-- DropForeignKey
ALTER TABLE `prevent_form_entries` DROP FOREIGN KEY `prevent_form_entries_prevent_form_id_fkey`;

-- DropForeignKey
ALTER TABLE `program_form_entries` DROP FOREIGN KEY `program_form_entries_program_form_id_fkey`;

-- DropForeignKey
ALTER TABLE `service_form_entries` DROP FOREIGN KEY `service_form_entries_service_form_id_fkey`;

-- DropForeignKey
ALTER TABLE `vibra_form_entries` DROP FOREIGN KEY `vibra_form_entries_vibra_form_id_fkey`;

-- AlterTable
ALTER TABLE `counsel_therapy_forms` ADD COLUMN `age` VARCHAR(191) NULL,
    ADD COLUMN `counsel_therapy_seq` INTEGER NULL,
    ADD COLUMN `job` VARCHAR(191) NULL,
    ADD COLUMN `past_experience` VARCHAR(191) NULL,
    ADD COLUMN `residence` VARCHAR(191) NULL,
    ADD COLUMN `score1` VARCHAR(191) NULL,
    ADD COLUMN `score10` VARCHAR(191) NULL,
    ADD COLUMN `score11` VARCHAR(191) NULL,
    ADD COLUMN `score12` VARCHAR(191) NULL,
    ADD COLUMN `score13` VARCHAR(191) NULL,
    ADD COLUMN `score14` VARCHAR(191) NULL,
    ADD COLUMN `score15` VARCHAR(191) NULL,
    ADD COLUMN `score16` VARCHAR(191) NULL,
    ADD COLUMN `score17` VARCHAR(191) NULL,
    ADD COLUMN `score18` VARCHAR(191) NULL,
    ADD COLUMN `score19` VARCHAR(191) NULL,
    ADD COLUMN `score2` VARCHAR(191) NULL,
    ADD COLUMN `score20` VARCHAR(191) NULL,
    ADD COLUMN `score21` VARCHAR(191) NULL,
    ADD COLUMN `score22` VARCHAR(191) NULL,
    ADD COLUMN `score23` VARCHAR(191) NULL,
    ADD COLUMN `score24` VARCHAR(191) NULL,
    ADD COLUMN `score25` VARCHAR(191) NULL,
    ADD COLUMN `score26` VARCHAR(191) NULL,
    ADD COLUMN `score27` VARCHAR(191) NULL,
    ADD COLUMN `score28` VARCHAR(191) NULL,
    ADD COLUMN `score29` VARCHAR(191) NULL,
    ADD COLUMN `score3` VARCHAR(191) NULL,
    ADD COLUMN `score30` VARCHAR(191) NULL,
    ADD COLUMN `score31` VARCHAR(191) NULL,
    ADD COLUMN `score32` VARCHAR(191) NULL,
    ADD COLUMN `score33` VARCHAR(191) NULL,
    ADD COLUMN `score34` VARCHAR(191) NULL,
    ADD COLUMN `score35` VARCHAR(191) NULL,
    ADD COLUMN `score36` VARCHAR(191) NULL,
    ADD COLUMN `score37` VARCHAR(191) NULL,
    ADD COLUMN `score38` VARCHAR(191) NULL,
    ADD COLUMN `score39` VARCHAR(191) NULL,
    ADD COLUMN `score4` VARCHAR(191) NULL,
    ADD COLUMN `score40` VARCHAR(191) NULL,
    ADD COLUMN `score41` VARCHAR(191) NULL,
    ADD COLUMN `score42` VARCHAR(191) NULL,
    ADD COLUMN `score43` VARCHAR(191) NULL,
    ADD COLUMN `score44` VARCHAR(191) NULL,
    ADD COLUMN `score45` VARCHAR(191) NULL,
    ADD COLUMN `score46` VARCHAR(191) NULL,
    ADD COLUMN `score47` VARCHAR(191) NULL,
    ADD COLUMN `score48` VARCHAR(191) NULL,
    ADD COLUMN `score49` VARCHAR(191) NULL,
    ADD COLUMN `score5` VARCHAR(191) NULL,
    ADD COLUMN `score50` VARCHAR(191) NULL,
    ADD COLUMN `score51` VARCHAR(191) NULL,
    ADD COLUMN `score52` VARCHAR(191) NULL,
    ADD COLUMN `score53` VARCHAR(191) NULL,
    ADD COLUMN `score54` VARCHAR(191) NULL,
    ADD COLUMN `score55` VARCHAR(191) NULL,
    ADD COLUMN `score56` VARCHAR(191) NULL,
    ADD COLUMN `score57` VARCHAR(191) NULL,
    ADD COLUMN `score58` VARCHAR(191) NULL,
    ADD COLUMN `score59` VARCHAR(191) NULL,
    ADD COLUMN `score6` VARCHAR(191) NULL,
    ADD COLUMN `score60` VARCHAR(191) NULL,
    ADD COLUMN `score61` VARCHAR(191) NULL,
    ADD COLUMN `score62` VARCHAR(191) NULL,
    ADD COLUMN `score7` VARCHAR(191) NULL,
    ADD COLUMN `score8` VARCHAR(191) NULL,
    ADD COLUMN `score9` VARCHAR(191) NULL,
    ADD COLUMN `sex` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `healing_forms` ADD COLUMN `age` VARCHAR(191) NULL,
    ADD COLUMN `healing_seq` INTEGER NULL,
    ADD COLUMN `job` VARCHAR(191) NULL,
    ADD COLUMN `residence` VARCHAR(191) NULL,
    ADD COLUMN `score1` VARCHAR(191) NULL,
    ADD COLUMN `score10` VARCHAR(191) NULL,
    ADD COLUMN `score11` VARCHAR(191) NULL,
    ADD COLUMN `score12` VARCHAR(191) NULL,
    ADD COLUMN `score13` VARCHAR(191) NULL,
    ADD COLUMN `score14` VARCHAR(191) NULL,
    ADD COLUMN `score15` VARCHAR(191) NULL,
    ADD COLUMN `score16` VARCHAR(191) NULL,
    ADD COLUMN `score17` VARCHAR(191) NULL,
    ADD COLUMN `score18` VARCHAR(191) NULL,
    ADD COLUMN `score19` VARCHAR(191) NULL,
    ADD COLUMN `score2` VARCHAR(191) NULL,
    ADD COLUMN `score20` VARCHAR(191) NULL,
    ADD COLUMN `score21` VARCHAR(191) NULL,
    ADD COLUMN `score22` VARCHAR(191) NULL,
    ADD COLUMN `score3` VARCHAR(191) NULL,
    ADD COLUMN `score4` VARCHAR(191) NULL,
    ADD COLUMN `score5` VARCHAR(191) NULL,
    ADD COLUMN `score6` VARCHAR(191) NULL,
    ADD COLUMN `score7` VARCHAR(191) NULL,
    ADD COLUMN `score8` VARCHAR(191) NULL,
    ADD COLUMN `score9` VARCHAR(191) NULL,
    ADD COLUMN `sex` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `hrv_forms` ADD COLUMN `age` VARCHAR(191) NULL,
    ADD COLUMN `hrv_seq` INTEGER NULL,
    ADD COLUMN `job` VARCHAR(191) NULL,
    ADD COLUMN `residence` VARCHAR(191) NULL,
    ADD COLUMN `score1` VARCHAR(191) NULL,
    ADD COLUMN `score2` VARCHAR(191) NULL,
    ADD COLUMN `score3` VARCHAR(191) NULL,
    ADD COLUMN `score4` VARCHAR(191) NULL,
    ADD COLUMN `score5` VARCHAR(191) NULL,
    ADD COLUMN `score6` VARCHAR(191) NULL,
    ADD COLUMN `score7` VARCHAR(191) NULL,
    ADD COLUMN `score8` VARCHAR(191) NULL,
    ADD COLUMN `sex` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `prevent_forms` ADD COLUMN `age` VARCHAR(191) NULL,
    ADD COLUMN `job` VARCHAR(191) NULL,
    ADD COLUMN `prevent_seq` INTEGER NULL,
    ADD COLUMN `residence` VARCHAR(191) NULL,
    ADD COLUMN `score1` VARCHAR(191) NULL,
    ADD COLUMN `score10` VARCHAR(191) NULL,
    ADD COLUMN `score11` VARCHAR(191) NULL,
    ADD COLUMN `score12` VARCHAR(191) NULL,
    ADD COLUMN `score13` VARCHAR(191) NULL,
    ADD COLUMN `score14` VARCHAR(191) NULL,
    ADD COLUMN `score15` VARCHAR(191) NULL,
    ADD COLUMN `score16` VARCHAR(191) NULL,
    ADD COLUMN `score17` VARCHAR(191) NULL,
    ADD COLUMN `score18` VARCHAR(191) NULL,
    ADD COLUMN `score19` VARCHAR(191) NULL,
    ADD COLUMN `score2` VARCHAR(191) NULL,
    ADD COLUMN `score20` VARCHAR(191) NULL,
    ADD COLUMN `score3` VARCHAR(191) NULL,
    ADD COLUMN `score4` VARCHAR(191) NULL,
    ADD COLUMN `score5` VARCHAR(191) NULL,
    ADD COLUMN `score6` VARCHAR(191) NULL,
    ADD COLUMN `score7` VARCHAR(191) NULL,
    ADD COLUMN `score8` VARCHAR(191) NULL,
    ADD COLUMN `score9` VARCHAR(191) NULL,
    ADD COLUMN `sex` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `program_forms` ADD COLUMN `age` VARCHAR(191) NULL,
    ADD COLUMN `expectation` TEXT NULL,
    ADD COLUMN `improvement` TEXT NULL,
    ADD COLUMN `job` VARCHAR(191) NULL,
    ADD COLUMN `program_seq` INTEGER NULL,
    ADD COLUMN `residence` VARCHAR(191) NULL,
    ADD COLUMN `score1` VARCHAR(191) NULL,
    ADD COLUMN `score10` VARCHAR(191) NULL,
    ADD COLUMN `score11` VARCHAR(191) NULL,
    ADD COLUMN `score12` VARCHAR(191) NULL,
    ADD COLUMN `score2` VARCHAR(191) NULL,
    ADD COLUMN `score3` VARCHAR(191) NULL,
    ADD COLUMN `score4` VARCHAR(191) NULL,
    ADD COLUMN `score5` VARCHAR(191) NULL,
    ADD COLUMN `score6` VARCHAR(191) NULL,
    ADD COLUMN `score7` VARCHAR(191) NULL,
    ADD COLUMN `score8` VARCHAR(191) NULL,
    ADD COLUMN `score9` VARCHAR(191) NULL,
    ADD COLUMN `sex` VARCHAR(191) NULL,
    ADD COLUMN `type` VARCHAR(191) NULL DEFAULT '참여자';

-- AlterTable
ALTER TABLE `service_forms` ADD COLUMN `age` VARCHAR(191) NULL,
    ADD COLUMN `facility_opinion` TEXT NULL,
    ADD COLUMN `job` VARCHAR(191) NULL,
    ADD COLUMN `operation_opinion` TEXT NULL,
    ADD COLUMN `residence` VARCHAR(191) NULL,
    ADD COLUMN `score1` VARCHAR(191) NULL,
    ADD COLUMN `score10` VARCHAR(191) NULL,
    ADD COLUMN `score11` VARCHAR(191) NULL,
    ADD COLUMN `score12` VARCHAR(191) NULL,
    ADD COLUMN `score13` VARCHAR(191) NULL,
    ADD COLUMN `score14` VARCHAR(191) NULL,
    ADD COLUMN `score15` VARCHAR(191) NULL,
    ADD COLUMN `score16` VARCHAR(191) NULL,
    ADD COLUMN `score17` VARCHAR(191) NULL,
    ADD COLUMN `score18` VARCHAR(191) NULL,
    ADD COLUMN `score19` VARCHAR(191) NULL,
    ADD COLUMN `score2` VARCHAR(191) NULL,
    ADD COLUMN `score20` VARCHAR(191) NULL,
    ADD COLUMN `score21` VARCHAR(191) NULL,
    ADD COLUMN `score22` VARCHAR(191) NULL,
    ADD COLUMN `score23` VARCHAR(191) NULL,
    ADD COLUMN `score24` VARCHAR(191) NULL,
    ADD COLUMN `score25` VARCHAR(191) NULL,
    ADD COLUMN `score26` VARCHAR(191) NULL,
    ADD COLUMN `score27` VARCHAR(191) NULL,
    ADD COLUMN `score28` VARCHAR(191) NULL,
    ADD COLUMN `score3` VARCHAR(191) NULL,
    ADD COLUMN `score4` VARCHAR(191) NULL,
    ADD COLUMN `score5` VARCHAR(191) NULL,
    ADD COLUMN `score6` VARCHAR(191) NULL,
    ADD COLUMN `score7` VARCHAR(191) NULL,
    ADD COLUMN `score8` VARCHAR(191) NULL,
    ADD COLUMN `score9` VARCHAR(191) NULL,
    ADD COLUMN `service_seq` INTEGER NULL,
    ADD COLUMN `sex` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `vibra_forms` ADD COLUMN `age` VARCHAR(191) NULL,
    ADD COLUMN `job` VARCHAR(191) NULL,
    ADD COLUMN `residence` VARCHAR(191) NULL,
    ADD COLUMN `score1` VARCHAR(191) NULL,
    ADD COLUMN `score10` VARCHAR(191) NULL,
    ADD COLUMN `score2` VARCHAR(191) NULL,
    ADD COLUMN `score3` VARCHAR(191) NULL,
    ADD COLUMN `score4` VARCHAR(191) NULL,
    ADD COLUMN `score5` VARCHAR(191) NULL,
    ADD COLUMN `score6` VARCHAR(191) NULL,
    ADD COLUMN `score7` VARCHAR(191) NULL,
    ADD COLUMN `score8` VARCHAR(191) NULL,
    ADD COLUMN `score9` VARCHAR(191) NULL,
    ADD COLUMN `sex` VARCHAR(191) NULL,
    ADD COLUMN `vibra_seq` INTEGER NULL;

-- DropTable
DROP TABLE `counsel_form_entries`;

-- DropTable
DROP TABLE `counsel_forms`;

-- DropTable
DROP TABLE `counsel_therapy_form_entries`;

-- DropTable
DROP TABLE `healing_form_entries`;

-- DropTable
DROP TABLE `hrv_form_entries`;

-- DropTable
DROP TABLE `prevent_form_entries`;

-- DropTable
DROP TABLE `program_form_entries`;

-- DropTable
DROP TABLE `service_form_entries`;

-- DropTable
DROP TABLE `vibra_form_entries`;

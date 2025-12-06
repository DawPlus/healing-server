/*
  Warnings:

  - You are about to drop the column `heart_rate_post` on the `hrv_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `heart_rate_pre` on the `hrv_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `rmssd_post` on the `hrv_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `rmssd_pre` on the `hrv_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `sdnn_post` on the `hrv_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `sdnn_pre` on the `hrv_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `stress_index_post` on the `hrv_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `stress_index_pre` on the `hrv_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `emotional_post` on the `vibra_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `emotional_pre` on the `vibra_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `mental_post` on the `vibra_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `mental_pre` on the `vibra_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `physical_post` on the `vibra_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `physical_pre` on the `vibra_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `spiritual_post` on the `vibra_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `spiritual_pre` on the `vibra_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `total_post` on the `vibra_form_entries` table. All the data in the column will be lost.
  - You are about to drop the column `total_pre` on the `vibra_form_entries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `hrv_form_entries` DROP COLUMN `heart_rate_post`,
    DROP COLUMN `heart_rate_pre`,
    DROP COLUMN `rmssd_post`,
    DROP COLUMN `rmssd_pre`,
    DROP COLUMN `sdnn_post`,
    DROP COLUMN `sdnn_pre`,
    DROP COLUMN `stress_index_post`,
    DROP COLUMN `stress_index_pre`,
    ADD COLUMN `score1` VARCHAR(191) NULL,
    ADD COLUMN `score2` VARCHAR(191) NULL,
    ADD COLUMN `score3` VARCHAR(191) NULL,
    ADD COLUMN `score4` VARCHAR(191) NULL,
    ADD COLUMN `score5` VARCHAR(191) NULL,
    ADD COLUMN `score6` VARCHAR(191) NULL,
    ADD COLUMN `score7` VARCHAR(191) NULL,
    ADD COLUMN `score8` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `hrv_forms` ADD COLUMN `agency_id` INTEGER NULL,
    ADD COLUMN `identification_number` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `pv` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `vibra_form_entries` DROP COLUMN `emotional_post`,
    DROP COLUMN `emotional_pre`,
    DROP COLUMN `mental_post`,
    DROP COLUMN `mental_pre`,
    DROP COLUMN `physical_post`,
    DROP COLUMN `physical_pre`,
    DROP COLUMN `spiritual_post`,
    DROP COLUMN `spiritual_pre`,
    DROP COLUMN `total_post`,
    DROP COLUMN `total_pre`,
    ADD COLUMN `score1` VARCHAR(191) NULL,
    ADD COLUMN `score10` VARCHAR(191) NULL,
    ADD COLUMN `score2` VARCHAR(191) NULL,
    ADD COLUMN `score3` VARCHAR(191) NULL,
    ADD COLUMN `score4` VARCHAR(191) NULL,
    ADD COLUMN `score5` VARCHAR(191) NULL,
    ADD COLUMN `score6` VARCHAR(191) NULL,
    ADD COLUMN `score7` VARCHAR(191) NULL,
    ADD COLUMN `score8` VARCHAR(191) NULL,
    ADD COLUMN `score9` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `vibra_forms` ADD COLUMN `agency_id` INTEGER NULL,
    ADD COLUMN `identification_number` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `pv` VARCHAR(191) NULL;

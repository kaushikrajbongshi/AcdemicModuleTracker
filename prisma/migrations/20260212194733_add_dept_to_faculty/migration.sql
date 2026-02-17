/*
  Warnings:

  - Added the required column `dept_id` to the `faculty` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `faculty` ADD COLUMN `dept_id` VARCHAR(10) NOT NULL;

-- CreateIndex
CREATE INDEX `faculty_dept_id_idx` ON `faculty`(`dept_id`);

-- AddForeignKey
ALTER TABLE `faculty` ADD CONSTRAINT `faculty_dept_id_fkey` FOREIGN KEY (`dept_id`) REFERENCES `department`(`dept_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

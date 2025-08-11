-- Add new fields to Task table
ALTER TABLE `task` ADD COLUMN `deleted` INT NOT NULL DEFAULT 0;
ALTER TABLE `task` ADD COLUMN `push_count` INT NOT NULL DEFAULT 0;
ALTER TABLE `task` ADD COLUMN `archived` INT NOT NULL DEFAULT 0;
ALTER TABLE `task` ADD COLUMN `archived_at` DATETIME NULL;

-- Add new fields to Sub_task table
ALTER TABLE `sub_task` ADD COLUMN `deleted` INT NOT NULL DEFAULT 0;
ALTER TABLE `sub_task` ADD COLUMN `push_count` INT NOT NULL DEFAULT 0;

-- Add Cancelled status to task_status table if not exists
INSERT IGNORE INTO `task_status` (`status`) VALUES ('Cancelled');

-- Update existing tasks to have default status as Pending (statusId = 1)
-- This assumes Pending has id = 1, adjust if different
UPDATE `task` SET `statusId` = 1 WHERE `statusId` IS NULL;
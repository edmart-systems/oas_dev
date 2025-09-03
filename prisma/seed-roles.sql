-- Add ADMIN role if you want to extend beyond MANAGER and EMPLOYEE
-- This is optional - your current system works with just MANAGER (1) and EMPLOYEE (2)

-- Check if ADMIN role exists, if not add it
INSERT IGNORE INTO role (role_id, role, role_desc) VALUES 
(0, 'ADMIN', 'System Administrator with full access'),
(1, 'MANAGER', 'Manager with elevated permissions'),
(2, 'EMPLOYEE', 'Regular employee with basic permissions');

-- Update existing roles if needed
UPDATE role SET role = 'MANAGER', role_desc = 'Manager with elevated permissions' WHERE role_id = 1;
UPDATE role SET role = 'EMPLOYEE', role_desc = 'Regular employee with basic permissions' WHERE role_id = 2;
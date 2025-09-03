export type UserRoleId = 1 | 2; // 1 = MANAGER, 2 = EMPLOYEE

export function getAllowedLocationTypes(roleId: UserRoleId) {
  if (roleId === 1) return ['MAIN_STORE', 'BRANCH', 'INVENTORY_POINT']; // MANAGER
  return ['INVENTORY_POINT']; // EMPLOYEE
}

export function canSelectParent(roleId: UserRoleId, locationType: string) {
  if (locationType === 'BRANCH') return roleId === 1; // Only MANAGER
  if (locationType === 'INVENTORY_POINT') return roleId === 1; // Only MANAGER
  return false;
}
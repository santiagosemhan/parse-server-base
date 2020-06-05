import { RolesType } from '../../types/constants';

const getUserRoles = async (user: Parse.User): Promise<Parse.Role[]> => {
  const roles = await new Parse.Query(Parse.Role).equalTo('users', user).find();
  return roles;
};

const hasUserRole = async (user: Parse.User, roleName: Sensbox.RolesType): Promise<boolean> => {
  const roles = await new Parse.Query(Parse.Role)
    .equalTo('name', roleName)
    .equalTo('users', user)
    .find();

  if (roles.length === 0) return false;
  return true;
};

const ensureIsAdmin = async (user: Parse.User): Promise<boolean> => {
  const isAdmin = await hasUserRole(user, RolesType.ADMINISTRATOR);
  if (!isAdmin) {
    throw new Parse.Error(Parse.Error.OPERATION_FORBIDDEN, 'Cannot perform this action.');
  }
  return true;
};

const getAdminRole = async (): Promise<Parse.Role | undefined> => {
  const roleQuery = new Parse.Query(Parse.Role);
  roleQuery.equalTo('name', RolesType.ADMINISTRATOR);
  const role = await roleQuery.first({ useMasterKey: true });
  return role;
};

export default {
  getUserRoles,
  hasUserRole,
  ensureIsAdmin,
  getAdminRole,
};

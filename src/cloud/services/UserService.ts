import { getQueryAuthOptions } from '../utils';
import AccountService from './AccountService';

const SYSTEM_ROLES = ['role:ROLE_SUPER_ADMIN'];

const requestObjectPermissions = async (
  className: string,
  objectId: string,
  user: Parse.User,
  master: boolean | undefined,
) => {
  if (!(className && objectId)) {
    throw new Parse.Error(400, 'Invalid Parameters: className and objectId should be provided');
  }
  const objectQuery = new Parse.Query(className);
  const queryOptions = getQueryAuthOptions(user, master);
  const object = await objectQuery.get(objectId, queryOptions);
  const ACL = object.getACL();
  if (!ACL) throw new Error('Object has no set ACL rules');
  const permissions: Sensbox.Permissions = {
    public: {
      read: ACL.getPublicReadAccess(),
      write: ACL.getPublicWriteAccess(),
    },
    users: [],
    roles: [],
  };

  const promises = Object.keys(ACL.permissionsById)
    .filter((id) => !id.includes('role:'))
    .map((userId) => {
      const query = new Parse.Query('Account');
      const User = Parse.Object.extend('_User');
      query.equalTo('user', User.createWithoutData(userId).toPointer());
      query.include('user');
      return query.first({ useMasterKey: true }).then((value) => {
        const account = <Sensbox.Account>value;
        if (!account) return null;
        return {
          userId,
          read: ACL.permissionsById[userId].read,
          write: ACL.permissionsById[userId].write,
          account: account.flat(),
        };
      });
    });

  const users = await Promise.all(promises);
  permissions.users = users.filter((u) => !!u);

  const rolesPromises = Object.keys(ACL.permissionsById)
    .filter((id) => id.includes('role:') && !SYSTEM_ROLES.includes(id))
    .map((roleName) => {
      const [, relatedClassName, relatedObjectId] = roleName.split('_');
      // eslint-disable-next-line operator-linebreak
      const sClassName =
        relatedClassName.charAt(0).toUpperCase() + relatedClassName.toLowerCase().slice(1);
      const query = new Parse.Query(sClassName);
      return query.get(relatedObjectId, { useMasterKey: true }).then((obj) => {
        if (!obj.get('defaultRole')) return null;
        return {
          name: roleName.replace('role:', ''),
          className: sClassName,
          object: obj,
          read: ACL.permissionsById[roleName].read,
          write: ACL.permissionsById[roleName].write,
        };
      });
    });

  const roles = await Promise.all(rolesPromises);
  permissions.roles = roles.filter((r) => !!r);

  return { permissions };
};

// TODO: check if there is a need of control roles
const findUsersByText = async (text: string, user: Parse.User) => {
  // Query for username or email in _User Class
  const usernameQuery = new Parse.Query('_User');
  usernameQuery.matches('username', new RegExp(`${text}`, 'i'));
  const emailQuery = new Parse.Query('_User');
  emailQuery.matches('email', new RegExp(`${text}`, 'i'));
  const userQuery = Parse.Query.or(usernameQuery, emailQuery);

  // Prevent to fetch the user that request endpoint
  userQuery.notEqualTo('objectId', user.id);
  const result = await userQuery.find({ useMasterKey: true });
  if (result.length > 0) {
    const results = await Promise.all(
      result.map((u) => AccountService.findByUser(<Parse.User>u, true)),
    );
    return results
      .filter((a) => a !== undefined)
      .map((a) => {
        const account = <Sensbox.Account>a;
        return account.flat();
      });
  }
  // If no results, will query on Account Class
  const firstNameQuery = new Parse.Query('Account');
  firstNameQuery.matches('firstName', new RegExp(`${text}`, 'i'));
  const lastNameQuery = new Parse.Query('Account');
  lastNameQuery.matches('lastName', new RegExp(`${text}`, 'i'));
  const accountQuery = Parse.Query.or(firstNameQuery, lastNameQuery);
  accountQuery.include('user');

  // Prevent to fetch the user that request endpoint
  accountQuery.notEqualTo('user', user.toPointer());
  // eslint-disable-next-line keyword-spacing
  const accounts = <Sensbox.Account[]>await accountQuery.find({ useMasterKey: true });
  return accounts.map((a) => a.flat());
};

const findRolesByUser = async (user: Parse.User) => {
  const roles = await new Parse.Query(Parse.Role).equalTo('users', user).find();
  return roles;
};

const clearUserSessions = async (user: Parse.User) => {
  const query = new Parse.Query(Parse.Session);
  query.equalTo('user', user.toPointer());
  const sessions = await query.find({ useMasterKey: true });
  const promises = sessions.map((session) => session.destroy({ useMasterKey: true }));
  const sessionsCleared = await Promise.all(promises);
  return { sessions: sessionsCleared.map((s) => s.get('sessionToken')) };
};

export default {
  requestObjectPermissions,
  findUsersByText,
  findRolesByUser,
  clearUserSessions,
};

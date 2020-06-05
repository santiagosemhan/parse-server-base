import Base from './Base';
import SecurityService from '../services/SecurityService';
import { RolesType } from '../../types/constants';

const { UserService } = require('../services');

class Account extends Base {
  constructor() {
    super(Account.prototype.constructor.name);
  }

  static async beforeSave(request: Parse.Cloud.BeforeSaveRequest) {
    await super.beforeSave(request);
    try {
      const { master, user: requestUser, object: account, installationId } = request;
      if (master) return;
      if (account.isNew()) {
        const email = account.get('email');
        const password = account.get('password');
        const isBanned = !account.get('active');

        // If no email and password provided throw an error.
        if (!(email && password)) {
          throw new Parse.Error(
            Parse.Error.EMAIL_MISSING,
            'Cannot create an account without email and password',
          );
        }

        const userAttributes = {
          email,
          isBanned,
        };
        const user = await Parse.User.signUp(email, password, userAttributes, {
          useMasterKey: true,
          installationId,
        });
        account.set('user', user);
        // signup via mobile app
        if (!requestUser) {
          account.set('createdBy', user);
        }
        const acl = account.getACL();
        if (acl) {
          acl.setWriteAccess(user, true);
          acl.setReadAccess(user, true);
          account.setACL(acl);
        }
      } else {
        const user = account.get('user');
        const newPassword = account.get('password');
        const isBanned = !account.get('active');
        user.set('isBanned', isBanned);
        if (newPassword) {
          user.setPassword(newPassword);
        }
        await user.save(null, { useMasterKey: true });
        if (isBanned) await UserService.clearUserSessions(user);
      }

      account.unset('password');
      account.unset('email');

      request.context = {
        userAccount: account.get('user'),
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
      const { code, message: msg } = error;
      let message;
      switch (code) {
        case 202:
          message = {
            username: [msg],
          };
          break;
        case 203:
          message = {
            email: [msg],
          };
          break;
        default:
          message = {
            default: [msg],
          };
          break;
      }
      throw new Parse.Error(400, JSON.stringify(message));
    }
  }

  static async afterFind(request: Parse.Cloud.AfterFindRequest) {
    const { objects } = request;
    const promises = objects.map(async (account: Parse.Object) => {
      if (account.get('user')) {
        try {
          const user = await account.get('user').fetch({ useMasterKey: true });
          const isAdmin = await SecurityService.hasUserRole(user, RolesType.ADMINISTRATOR);
          account.set('username', user.getUsername());
          account.set('email', user.getEmail());
          account.set('isAdmin', isAdmin);
        } catch (error) {
          account.set('isAdmin', false);
        }
      }
      return account;
    });
    const response = await Promise.all(promises);
    return response;
  }

  static async afterSave(request: Parse.Cloud.AfterSaveRequest) {
    const { object: account, master } = request;
    if (master) return account;
    if (!account.existed()) {
      const { userAccount } = <{ userAccount: Parse.User }>request.context;
      account.set('username', userAccount.getUsername());
      account.set('email', userAccount.getEmail());
      account.set('userSessionToken', userAccount.getSessionToken());
      userAccount.set('account', account);
      userAccount.save(null, { cascadeSave: false, useMasterKey: true });
    }
    return account;
  }

  static async afterDelete(request: Parse.Cloud.AfterDeleteRequest) {
    const { object: account } = request;
    const user = account.get('user');
    if (user) {
      await UserService.clearUserSessions(user);
      user.destroy({ useMasterKey: true });
    }
  }

  flat() {
    const profilePhoto = this.get('user').get('profilePhoto');
    return {
      userId: this.get('user').id,
      accountId: this.id,
      profilePhoto: profilePhoto || null,
      username: this.get('username'),
      firstName: this.get('firstName'),
      lastName: this.get('lastName'),
    };
  }
}

export default Account;

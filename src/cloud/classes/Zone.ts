import Base from './Base';

class Zone extends Base {
  constructor() {
    super(Zone.prototype.constructor.name);
  }

  static async beforeSave(request: Parse.Cloud.BeforeSaveRequest) {
    await super.beforeSave(request);
  }

  static async afterSave(request: Parse.Cloud.AfterSaveRequest) {
    const { object, user } = request;
    if (user && !object.has('defaultRole')) {
      const roleACL = new Parse.ACL();
      roleACL.setPublicReadAccess(true);
      const role = new Parse.Role(`ROLE_${Zone.name.toUpperCase()}_${object.id}`, roleACL);
      await role.save();
      object.set('defaultRole', role);
      await object.save(null, { sessionToken: user.getSessionToken() });
    }
  }

  static async afterDelete(request: Parse.Cloud.AfterDeleteRequest) {
    const { object: organization } = request;
    const defaultRole = organization.get('defaultRole');
    if (defaultRole) {
      await defaultRole.destroy({ useMasterKey: true });
    }
  }

  toString() {
    return this.get('name');
  }
}

export default Zone;

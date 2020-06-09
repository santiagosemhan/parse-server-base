declare namespace Sensbox {
  type RolesType = 'ROLE_SUPERADMIN' | 'ROLE_ADMINISTRATOR';

  type NotificationTypesType = '' | '';

  type CloudFunction = (request: Parse.Cloud.FunctionRequest) => any;
  type SecureCloudFunction = (request: SecureFunctionRequest) => any;

  type RouteDefinition = {
    action: CloudFunction | SecureCloudFunction;
    secure: boolean;
    onlyMaster?: boolean;
  };

  type RouteDefinitions = {
    [key: string]: RouteDefinition;
  };

  interface LatLng {
    lat: number;
    lng: number;
  }

  type UserType = {
    username: String;
    email: number;
    emailVerified: number;
  };

  type MailType = {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    templateId?: string;
    dynamicTemplateData?: { [key: string]: any };
  };

  type MailTypeRequired = MailType & ({ text: string } | { html: string } | { templateId: string });

  type NotificationDataType = {
    type: NotificationTypesType;
    message: string;
    data: Object;
  };

  type AccountType = {
    username: string;
    email: string;
    password: string;
    firstName: string;
    middleName: string;
    lastName: string;
    nickname: string;
    facebook: string;
    facebookProfilePhotoUrl: string;
    aboutMe: string;
    fbAuthData: Parse.AuthData | undefined;
  };

  type AddressType = {
    city: string;
    account: Parse.Object;
    state: string;
    country: string;
    description: string;
  };

  type ReadWritePerms = {
    read: boolean;
    write: boolean;
  };

  type Permissions = {
    users: any[];
    roles: any[];
    public: ReadWritePerms;
  };

  interface SecureFunctionRequest extends Parse.Cloud.FunctionRequest {
    user: Parse.User;
  }

  interface Account extends Parse.Object {
    flat(): Object;
  }

}

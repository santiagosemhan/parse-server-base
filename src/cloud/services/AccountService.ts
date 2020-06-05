import { getQueryAuthOptions } from '../utils';
import SecurityService from './SecurityService';
import Address from '../classes/Address';

const findById = async (accountId: string): Promise<Parse.Object> => {
  const accountQuery = new Parse.Query('Account');
  return accountQuery.get(accountId, { useMasterKey: true });
};

const findByUser = (
  user: Parse.User,
  master: boolean = false,
): Promise<Parse.Object | undefined> => {
  const queryOptions = getQueryAuthOptions(user, master);
  const query = new Parse.Query('Account');
  query.include('user');
  query.equalTo('user', user);
  return query.first(queryOptions);
};

const setAccountToAdmin = async (account: Parse.Object, user: Parse.User) => {
  try {
    await SecurityService.ensureIsAdmin(user);
    const userOfAccount = account.get('user');
    if (userOfAccount) {
      const role = await SecurityService.getAdminRole();
      if (role) {
        role.getUsers().add(account.get('user'));
        role.save(null, { useMasterKey: true });
      }
    }
    return account;
  } catch (error) {
    throw new Error(error.message);
  }
};

const setAccountToBasic = async (account: Parse.Object, user: Parse.User) => {
  try {
    await SecurityService.ensureIsAdmin(user);
    const userOfAccount = account.get('user');
    if (userOfAccount) {
      const role = await SecurityService.getAdminRole();
      if (role) {
        role.getUsers().remove(account.get('user'));
        role.save(null, { useMasterKey: true });
      }
    }
    return account;
  } catch (error) {
    throw new Error(error.message);
  }
};

const removeDefaultFromOtherAddresses = async (
  address: Parse.Object,
  user: Parse.User,
): Promise<Parse.Object[]> => {
  const query = new Parse.Query('Address');
  query.notEqualTo('objectId', address.id);
  const adresses: Parse.Object[] = await query.find({ sessionToken: user.getSessionToken() });
  return Promise.all(
    adresses.map((a) => {
      a.set('default', false);
      return a.save(null, { useMasterKey: false, sessionToken: user.getSessionToken() });
    }),
  );
};

const findAccountAddress = async (account: Parse.Object): Promise<Parse.Object[]> => {
  const authOptions: Parse.ScopeOptions = getQueryAuthOptions(undefined, true);
  const query = new Parse.Query('Address');
  query.equalTo('account', account);
  const addresses: Parse.Object[] = await query.find(authOptions);
  return addresses;
};

const findDefaultAddress = async (account: Parse.Object): Promise<Parse.Object> => {
  const authOptions: Parse.ScopeOptions = getQueryAuthOptions(undefined, true);
  const query: Parse.Query = new Parse.Query('Address');
  query.equalTo('account', account);
  query.equalTo('default', true);
  const address: Parse.Object | void = await query.first(authOptions);
  if (!address) throw new Error(`Cannot find default Address for account ${account.id}`);
  return address;
};

const findAccountAddressById = async (addressId: string): Promise<Parse.Object> => {
  try {
    const authOptions: Parse.ScopeOptions = getQueryAuthOptions(undefined, true);
    const query = new Parse.Query('Address');
    const address: Parse.Object = await query.get(addressId, authOptions);
    return address;
  } catch (error) {
    throw new Error(`Address id '${addressId}' not found`);
  }
};

const addNewAddress = async (
  attributes: Sensbox.AddressType,
  user: Parse.User,
): Promise<Parse.Object> => {
  const authOptions: Parse.ScopeOptions = getQueryAuthOptions(user, false);
  const address: Parse.Object = new Address();
  const account = await findByUser(user);
  address.set({ ...attributes, account });
  await address.save(null, authOptions);
  if (address.get('default')) {
    await removeDefaultFromOtherAddresses(address, user);
  }
  return address;
};

const editAddress = async (
  addresId: string,
  attributes: Sensbox.AddressType,
  user: Parse.User,
): Promise<Parse.Object> => {
  const authOptions: Parse.ScopeOptions = getQueryAuthOptions(user, false);
  const query: Parse.Query = new Parse.Query('Address');
  const address: Parse.Object = await query.get(addresId, { sessionToken: user.getSessionToken() });
  address.set({ ...attributes });
  await address.save(null, authOptions);
  if (address.get('default')) {
    await removeDefaultFromOtherAddresses(address, user);
  }

  return address;
};

export default {
  findById,
  findByUser,
  setAccountToAdmin,
  setAccountToBasic,
  addNewAddress,
  editAddress,
  findDefaultAddress,
  findAccountAddress,
  findAccountAddressById,
};

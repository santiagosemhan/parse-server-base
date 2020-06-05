import AccountService from '../services/AccountService';

const setAccountToAdmin = async (request: Sensbox.SecureFunctionRequest) => {
  const { user, params } = request;
  const { accountId } = params;
  const account = await AccountService.findById(accountId);
  return AccountService.setAccountToAdmin(account, user);
};

const setAccountToBasic = async (request: Sensbox.SecureFunctionRequest) => {
  const { user, params } = request;
  const { accountId } = params;
  const account = await AccountService.findById(accountId);
  return AccountService.setAccountToBasic(account, user);
};

const addNewAddress = async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
  const { params, user } = <{ params: Sensbox.AddressType; user: Parse.User }>request;
  return AccountService.addNewAddress(params, user);
};

const editAddress = async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
  const { params, user } = <{ params: Parse.Cloud.Params; user: Parse.User }>request;
  const { addressId, attributes } = params;
  return AccountService.editAddress(addressId, attributes, user);
};

export default {
  setAccountToAdmin,
  setAccountToBasic,
  addNewAddress,
  editAddress,
};

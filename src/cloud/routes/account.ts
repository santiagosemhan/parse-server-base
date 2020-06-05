import { AccountController } from '../controllers';

const definitions: Sensbox.RouteDefinitions = {
  setAccountToAdmin: {
    action: AccountController.setAccountToAdmin,
    secure: true,
  },
  setAccountToBasic: {
    action: AccountController.setAccountToBasic,
    secure: true,
  },
  addNewAddress: {
    action: AccountController.addNewAddress,
    secure: true,
  },
  editAddress: {
    action: AccountController.editAddress,
    secure: true,
  },
};

export default definitions;

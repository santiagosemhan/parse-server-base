import { DefaultController } from '../controllers';

const definitions: Sensbox.RouteDefinitions = {
  me: {
    action: DefaultController.me,
    secure: true,
  },
  ping: {
    action: DefaultController.ping,
    secure: false,
  },
  findUsersByText: {
    action: DefaultController.findUsersByText,
    secure: true,
  },
  requestObjectPermissions: {
    action: DefaultController.requestObjectPermissions,
    secure: true,
  },
};

export default definitions;

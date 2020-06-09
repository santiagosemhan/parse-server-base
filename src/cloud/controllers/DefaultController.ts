import { UserService } from '../services';

const ping = () => ({
  msg: 'pong',
  time: new Date(),
});

const me = (request: Sensbox.SecureFunctionRequest) => {
  const { user } = request;
  return user;
};

// TODO: check if there is a need of control roles
const findUsersByText = async (request: Sensbox.SecureFunctionRequest) => {
  const { user, params } = request;
  const { text } = params;
  return UserService.findUsersByText(text, user);
};

const requestObjectPermissions = async (request: Sensbox.SecureFunctionRequest) => {
  const { user, master, params } = request;
  const { className, objectId } = params;
  return UserService.requestObjectPermissions(className, objectId, user, master);
};

export default {
  me,
  ping,
  findUsersByText,
  requestObjectPermissions,
};

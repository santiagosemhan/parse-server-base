/**
 * Decorator function to apply to all functions that needs to check for user authentication
 * @param {*} callback
 */
function secure(callback: Function, onlyMaster: boolean = false): any {
  return (request: Parse.Cloud.FunctionRequest) => {
    const { master: isMaster, user } = request;
    if (onlyMaster && !isMaster) {
      throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Not Allowed');
    }
    if (!isMaster && !user) {
      const err: Parse.Error = new Parse.Error(
        Parse.Error.INVALID_SESSION_TOKEN,
        'User needs to be authenticated',
      );

      throw err;
    }
    // @ts-ignore
    return callback.call(this, request);
  };
}

const getQueryAuthOptions = (
  user: Parse.User | undefined = undefined,
  master: boolean = false,
): Parse.ScopeOptions => {
  let options: Parse.ScopeOptions = { useMasterKey: master };
  if (master) return options;
  if (user) {
    options = { ...options, sessionToken: user.getSessionToken() };
  }
  return options;
};

function getArraysIntersection(list1: [], list2: [] | undefined, ...otherLists: []): [] {
  const result: [] = [];
  if (arguments.length === 0) {
    throw new Error('getArraysIntersection cannot be called with no arguments');
  }
  if (!list2) return result;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < list1.length; i++) {
    const item1 = list1[i];
    let found = false;
    // eslint-disable-next-line no-plusplus
    for (let j = 0; j < list2.length && !found; j++) {
      found = JSON.stringify(item1) === JSON.stringify(list2[j]);
    }
    if (found === true) {
      result.push(item1);
    }
  }

  return otherLists.length
    ? getArraysIntersection(result, otherLists.shift(), ...otherLists)
    : result;
}

const nullParser = (
  opt?: boolean | string | null | number,
): string | undefined | null | number | boolean => {
  if (opt === 'null') {
    return null;
  }
  return opt;
};

const booleanParser = (
  opt?: boolean | string | null | number,
): string | undefined | null | number | boolean => {
  if (opt === 'false') {
    return false;
  }
  return Boolean(opt) === true;
};

export {
  getArraysIntersection,
  nullParser,
  booleanParser,
  secure,
  getQueryAuthOptions,
};

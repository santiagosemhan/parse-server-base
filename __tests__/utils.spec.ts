import {
  getQueryAuthOptions,
  nullParser,
  booleanParser,
  getArraysIntersection,
} from '../src/cloud/utils';

let user: Parse.User;

beforeAll(() => {
  user = new Parse.User();
  user.getSessionToken = jest.fn().mockReturnValue('sessionString');
});

describe('Auth option tests', () => {
  test('Auth Options should be valid objects with session token', () => {
    const authOption = { sessionToken: 'sessionString', useMasterKey: false };
    expect(getQueryAuthOptions(user)).toStrictEqual(authOption);
    expect(getQueryAuthOptions(user, false)).toStrictEqual(authOption);
    expect(getQueryAuthOptions(user, undefined)).toStrictEqual(authOption);
  });

  test('Auth Options should be valid objects with master true', () => {
    const authOption = { useMasterKey: true };
    expect(getQueryAuthOptions(undefined, true)).toStrictEqual(authOption);
    expect(getQueryAuthOptions(user, true)).toStrictEqual(authOption);
  });

  test('Auth Options should be valid objects with master false', () => {
    const authOption = { useMasterKey: false };
    expect(getQueryAuthOptions(undefined, false)).toStrictEqual(authOption);
    expect(getQueryAuthOptions()).toStrictEqual(authOption);
  });
});

describe('Array intersection tests', () => {
  test('array intersection should pass', () => {
    const arr1 = [1, 2, 3, 4];
    const arr2 = [4, 5, 6, 7];
    const arr3 = [4, 3];
    // @ts-ignore
    expect(getArraysIntersection(arr1, arr2, arr3)).toEqual([4]);
  });

  test('array intersection should return empty array', () => {
    const arr1 = [1, 2, 3, 4];
    const arr2 = [4, 5, 6, 7];
    const arr3 = [10, 12];
    // @ts-ignore
    expect(getArraysIntersection(arr1, arr2, arr3)).toEqual([]);
    // @ts-ignore
    expect(getArraysIntersection(arr1)).toEqual([]);
  });

  test('array intersection should throw an expection', () => {
    // @ts-ignore
    expect(() => getArraysIntersection()).toThrow(
      /^getArraysIntersection cannot be called with no arguments$/,
    );
  });
});

describe('Null Parser tests', () => {
  test('null parser should return null type', () => {
    expect(nullParser('null')).toEqual(null);
    expect(nullParser(null)).toEqual(null);
  });

  test('null parser should return input type', async () => {
    expect(nullParser(1)).toEqual(1);
    expect(nullParser('text')).toEqual('text');
    expect(nullParser(true)).toEqual(true);
  });
});

describe('boolean Parser tests', () => {
  test('boolean parser should return false', () => {
    expect(booleanParser('false')).toEqual(false);
    expect(booleanParser(null)).toEqual(false);
    expect(booleanParser(false)).toEqual(false);
  });

  test('boolean parser should return true', async () => {
    expect(booleanParser(1)).toEqual(true);
    expect(booleanParser(true)).toEqual(true);
    expect(booleanParser('true')).toEqual(true);
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash';

export const deepDiff = (fromObject: any, toObject: any) => {
  const changes: any = {};

  const buildPath = (path: any, _obj: any, key: any) =>
    _.isUndefined(path) ? key : `${path}.${key}`;

  const walk = (fromObject: any, toObject: any, path?: any) => {
    for (const key of _.keys(fromObject)) {
      const currentPath = buildPath(path, fromObject, key);
      if (!_.has(toObject, key)) {
        changes[currentPath] = { from: _.get(fromObject, key) };
      }
    }

    for (const [key, to] of _.entries(toObject)) {
      const currentPath = buildPath(path, toObject, key);
      if (!_.has(fromObject, key)) {
        changes[currentPath] = { to };
      } else {
        const from = _.get(fromObject, key);
        if (!_.isEqual(from, to)) {
          if (_.isObjectLike(to) && _.isObjectLike(from)) {
            walk(from, to, currentPath);
          } else {
            changes[currentPath] = { from, to };
          }
        }
      }
    }
  };

  walk(fromObject, toObject);

  return changes;
};

import { useState } from 'react';
import { Permission } from '/imports/api/users/collection';
import { hasPermission } from '/imports/api/users/methods/hasPermission';
export { useFind } from 'meteor/react-meteor-data';

const useHasPermission = (permission: Permission) => {
  const [result, setResult] = useState<[boolean, boolean]>([true, false]);

  hasPermission({ permission }).then((result) => {
    setResult([false, result]);
  });

  return result;
};

export default useHasPermission;

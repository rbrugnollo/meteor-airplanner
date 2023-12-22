import React, { useEffect, useState } from 'react';
import { Permission } from '/imports/api/users/collection';
import { hasPermission } from '/imports/api/users/methods/hasPermission';

interface AuthorizedProps {
  readonly permission: Permission;
  readonly children: JSX.Element;
}

const AuthorizedComponent = ({ children, permission }: AuthorizedProps) => {
  const [isLoaded, setLoaded] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  useEffect(() => {
    if (isLoaded) return;
    setLoaded(true);
    hasPermission({ permission }).then((hasPermission) => {
      setAuthorized(hasPermission);
    });
  }, []);
  if (!authorized) return <span />;
  return children;
};

export default AuthorizedComponent;

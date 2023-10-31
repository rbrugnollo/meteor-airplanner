import React from 'react';
import { Permission } from '/imports/api/users/collection';
import useHasPermission from '/imports/ui/shared/hooks/useHasPermission';

interface AuthorizedProps {
  readonly permission: Permission;
  readonly children: JSX.Element;
}

const AuthorizedComponent = ({ children, permission }: AuthorizedProps) => {
  const [verifying, hasPermission] = useHasPermission(permission);
  if (verifying || !hasPermission) return <span />;
  return children;
};

export default AuthorizedComponent;

import React from 'react';
import { useNavigate } from 'react-router';
import { Permission } from '/imports/api/users/collection';
import useHasPermission from '/imports/ui/shared/hooks/useHasPermission';

interface AuthorizedProps {
  readonly permission: Permission;
  readonly Component: () => JSX.Element;
}

const Authorized = ({ Component, permission }: AuthorizedProps) => {
  const navigate = useNavigate();
  const [verifying, hasPermission] = useHasPermission(permission);

  if (verifying) return <></>;
  if (!hasPermission) navigate('/app');

  return <Component />;
};

export default Authorized;

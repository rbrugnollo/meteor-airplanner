import React from 'react';
import { useNavigate } from 'react-router';
import { Permission } from '/imports/api/users/collection';
import { hasPermission } from '/imports/api/users/methods/hasPermission';

interface AuthorizedProps {
  readonly permission: Permission;
  readonly Component: () => JSX.Element;
}

const Authorized = ({ Component, permission }: AuthorizedProps) => {
  const navigate = useNavigate();
  if (!hasPermission({ permission })) navigate('/app');
  return <Component />;
};

export default Authorized;

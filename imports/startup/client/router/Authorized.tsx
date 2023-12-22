import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Permission } from '/imports/api/users/collection';
import { hasPermission } from '/imports/api/users/methods/hasPermission';

interface AuthorizedProps {
  readonly permission: Permission;
  readonly Component: () => JSX.Element;
}

const Authorized = ({ Component, permission }: AuthorizedProps) => {
  const navigate = useNavigate();
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded) return;
    hasPermission({ permission }).then((hasPermission) => {
      if (!hasPermission) navigate('/app');
      setLoaded(true);
    });
  }, []);
  return <Component />;
};

export default Authorized;

import React from 'react';
import { Roles } from 'meteor/alanning:roles';
import { useNavigate } from 'react-router';
import { Meteor } from 'meteor/meteor';
import { RoleName } from '/imports/api/users/collection';

interface AuthorizedProps {
  readonly roles: RoleName[];
  readonly Component: () => JSX.Element;
}

const Authorized = ({ Component, roles }: AuthorizedProps) => {
  const navigate = useNavigate();
  const loggedUserId = Meteor.userId();
  if (!Roles.userIsInRole(loggedUserId, roles)) navigate('/app');
  return <Component />;
};

export default Authorized;

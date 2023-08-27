import React from 'react';
import { useSubscribe } from 'meteor/react-meteor-data';
import { Spinner } from '@chakra-ui/react';
import { Roles } from 'meteor/alanning:roles';
import { useNavigate } from 'react-router';
import { Meteor } from 'meteor/meteor';

interface AuthorizedProps {
  readonly roles: string[];
  readonly Component: () => JSX.Element;
}

const Authorized = ({ Component, roles }: AuthorizedProps) => {
  const isLoading = useSubscribe('roles.user');
  const navigate = useNavigate();
  if (isLoading()) return <Spinner />;

  const loggedUserId = Meteor.userId();
  if (!Roles.userIsInRole(loggedUserId, roles)) navigate('/app');
  return <Component />;
};

export default Authorized;

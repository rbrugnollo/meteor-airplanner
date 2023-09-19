import React from 'react';
import { Box, ButtonBase } from '@mui/material';
import { Link as LinkType } from './links';
import { NavLink } from 'react-router-dom';

export interface SideNavItemProps {
  link: LinkType;
}

export const SideNavItem = ({ link }: SideNavItemProps) => {
  return (
    <li>
      <ButtonBase
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          display: 'flex',
          justifyContent: 'flex-start',
          pl: '16px',
          pr: '16px',
          py: '6px',
          textAlign: 'left',
          width: '100%',
          '&.active': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            '& .linkIcon': {
              color: 'primary.main',
            },
            '& .linkLabel': {
              color: 'common.white',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
        }}
        {...{
          component: NavLink,
          to: link.href,
          end: link.end,
        }}
      >
        <Box
          component="span"
          className="linkIcon"
          sx={{
            alignItems: 'center',
            display: 'inline-flex',
            justifyContent: 'center',
            mr: 2,
            color: 'neutral.400',
          }}
        >
          <link.Icon />
        </Box>
        <Box
          component="span"
          className="linkLabel"
          sx={{
            flexGrow: 1,
            fontFamily: (theme) => theme.typography.fontFamily,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: '24px',
            whiteSpace: 'nowrap',
            color: 'neutral.400',
          }}
        >
          {link.label}
        </Box>
      </ButtonBase>
    </li>
  );
};

export default SideNavItem;

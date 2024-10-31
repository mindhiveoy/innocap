'use client';

import { Drawer, List, ListItem, ListItemText, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const DRAWER_WIDTH = 240;

const StyledDrawer = styled(Drawer)(() => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
  },
}));

export function SideNav() {
  const menuItems = [
    { text: 'Dashboard', path: '/' },
    { text: 'Analytics', path: '/analytics' },
    { text: 'Settings', path: '/settings' },
  ];

  return (
    <StyledDrawer
      variant="permanent"
      anchor="left"
    >
      <Box sx={{ mt: 2, mb: 2 }}>
        <ListItem>
          <ListItemText 
            primary="Innocap" 
            primaryTypographyProps={{
              variant: 'h6',
              fontWeight: 700,
              color: 'neutral.dark',
            }}
          />
        </ListItem>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path}>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </StyledDrawer>
  );
} 
import { Box, CircularProgress } from '@mui/material';
import styled from '@emotion/styled';

const OverlayContainer = styled(Box)(({ theme }) => `
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 1150;
`);

export function LoadingOverlay() {
  return (
    <OverlayContainer>
      <CircularProgress 
        size={100}
        sx={{ 
          color: theme => theme.palette.primary.main,
        }} 
      />
    </OverlayContainer>
  );
} 
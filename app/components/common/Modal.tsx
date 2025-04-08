import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Fade,
  Backdrop,
  Typography
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiBackdrop-root': {
    backdropFilter: 'blur(4px)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  '& .MuiDialog-paper': {
    borderRadius: 8,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(1)
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  '& .MuiTypography-root': {
    fontWeight: 600
  }
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2, 3, 3),
}));

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <StyledDialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <StyledDialogTitle>
        <Typography variant="h6">{title}</Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close" size="small">
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent>
        {children}
      </StyledDialogContent>
    </StyledDialog>
  );
} 
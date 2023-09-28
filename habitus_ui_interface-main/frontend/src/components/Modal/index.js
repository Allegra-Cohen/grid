import React from 'react';
import Box from '@mui/material/Box';
import ModalMui from '@mui/material/Modal';
import { Button } from '../index'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  padding: '20px',
};

const Modal = ({ open, onClose, title, description, onConfirm }) => {

  return (
    <div>

      <ModalMui
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"

      >
        <Box sx={style}>
          <div style={{ fontSize: 18, fontWeight: 500, color: '#2c2c2c' }}>
            {title}
          </div>
          <div style={{ fontSize: 15,  color: '#2c2c2c' }}>
            {description}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', cursor: 'pointer', gap: 5, marginTop: 10 }}>
            <Button label="Discard" color="red" onClick={onClose} noGap />
            <Button label="Confirm" color="green" onClick={onConfirm} noGap />
          </div>
        </Box>
      </ModalMui>
    </div>
  );
};

export default Modal;


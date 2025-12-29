import React from 'react';
import { Modal, Backdrop } from '@mui/material';
import Lottie from "lottie-react";
import animationData from './lottie/loading.json';

const LoadingModal = () => {
  
  const lottieStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', outline: 'none', backgroundColor: 'transparent', }
  return (
    <Modal open={true} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' } }} >
        <div style={lottieStyle}>
            <Lottie animationData={animationData} loop={true} />
        </div>

    </Modal>
  );
}
export default LoadingModal;
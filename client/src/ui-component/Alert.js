import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import Slide from '@mui/material/Slide';
 
import AnimateButton from 'ui-component/extended/AnimateButton';
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });
   
function Alert({ message, isOpen, handleClose , title ="확인"}) {
  return createPortal(
    <Dialog
        open={isOpen}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        sx={{ "& .MuiDialog-paper": { width: 450, height: "auto" } }}>
      <DialogTitle>확인</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
      <AnimateButton>
            <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="primary" onClick={handleClose}> 
                확인
            </Button>
        </AnimateButton>
      </DialogActions>
    </Dialog>,
    document.body
  );
}

let isOpen = false;
let root = null;

function alert(message) {
  if (!isOpen) {
    isOpen = true;
    const alertRoot = document.createElement("div");
    document.body.appendChild(alertRoot);
    const handleClose = () => {
      isOpen = false;
      root.unmount();
    };
    root = createRoot(alertRoot);
    root.render(<Alert message={message} isOpen={isOpen} handleClose={handleClose} />);
  }
}

export { alert };

import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

// material-ui
import { ButtonBase } from '@mui/material';
import logo from "assets/images/healing.jpg"
// project imports
// import config from 'config';
import { MENU_OPEN } from 'store/actions';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = () => {
    const defaultId = useSelector((state) => state.customization.defaultId);
    const dispatch = useDispatch();
    const location = useLocation();
    
    // 현재 경로가 /new/로 시작하면 /new/page0으로 이동, 그 외에는 /main으로 이동
    const targetPath = location.pathname.startsWith('/new/') ? '/new/page0' : '/new/page0';
    
    return (
        <ButtonBase disableRipple onClick={() => dispatch({ type: MENU_OPEN, id: defaultId })} component={Link} to={targetPath}>
            <img src={logo}  style={{width : "190px"}} alt="logo"/>
        </ButtonBase>
    );
};

export default LogoSection;

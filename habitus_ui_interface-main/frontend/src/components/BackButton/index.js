

import { Icon } from '@iconify/react';
import { StyledDiv } from './styles';
import { Link } from 'react-router-dom';

function BackButton(props) {



  return (
    <>
      <Link style={{ color: '#0a0f54' }} to="/">
        <StyledDiv>
          <Icon icon="akar-icons:arrow-back" width="18" height="18" style={{ zIndex: 1 }} />
        </StyledDiv>

      </Link>
      <div>
        {props.screenName}
      </div>
    </>
  );
}

export default BackButton;



import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import './styles.css';

function BackButton(props) {
  return (
    <>
      <Link className='link-back-button' to={'/gallery'}>
        <div className="align-horizontal">
          <div className='styled-back-button'>
            <Icon icon="akar-icons:arrow-back" width="18" height="18" style={{ zIndex: 1 }} />
          </div>
          {props.screenName}
        </div>
      </Link>
    </>
  );
}

export default BackButton;

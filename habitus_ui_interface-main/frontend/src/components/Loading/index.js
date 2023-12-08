

import React from 'react';
import { Icon } from '@iconify/react';
import { StyledLoading } from './styles';

const Loading = () => {
  return (
    <StyledLoading>
      <Icon icon="line-md:loading-twotone-loop" width="50" height="50" color='#283B62' />
    </StyledLoading>

  );
};

export default Loading;


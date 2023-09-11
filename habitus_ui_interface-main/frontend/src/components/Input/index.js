import React from 'react';
import { StyledInput, InputContainer, IconContainer } from './styles';
import { Icon } from '@iconify/react';

const Input = ({ icon, placeholder, onKeyPress }) => {
  return (
    <InputContainer>
      <StyledInput placeholder={placeholder} onKeyPress={onKeyPress}/>
      <IconContainer>
        <Icon icon={icon} width="24" height="24" color="#B5B5B5" />
      </IconContainer>
    </InputContainer>
  );
};

export default Input;


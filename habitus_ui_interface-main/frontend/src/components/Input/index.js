import React from 'react';
import { StyledInput, InputContainer, IconContainer } from './styles';
import { Icon } from '@iconify/react';

const Input = ({ icon, placeholder, onKeyPress, onInput }) => {
  return (
    <InputContainer>
      <StyledInput placeholder={placeholder} onKeyPress={onKeyPress} onInput={onInput} />
      <IconContainer>
        <Icon icon={icon} width="24" height="24" color="#007BFF" style={{ cursor: 'pointer' }}/>
      </IconContainer>
    </InputContainer>
  );
};

export default Input;


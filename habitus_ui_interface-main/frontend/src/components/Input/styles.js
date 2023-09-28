import styled from 'styled-components';


export const InputContainer = styled.div`
  position: relative;
`;

export const StyledInput = styled.input`
  padding: 10px 40px 10px 10px;
  border: 1px solid #B5B5B5;
  border-radius: 5px;
  color: #333;
  font-size: 16px;
  width: 100%;
  box-sizing: border-box;
  outline: none;

  &::placeholder {
    color: #B5B5B5;
  }
`;

export const IconContainer = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 10px;
`;

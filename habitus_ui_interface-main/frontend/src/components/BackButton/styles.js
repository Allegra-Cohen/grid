import styled from 'styled-components';

export const StyledDiv = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px solid #2c2c2c; /* Cor do contorno */
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  color: #2c2c2c;
  background-color: transparent; /* Cor de fundo */
  transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;

  &:before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    background-color: #283B62; /* Cor do preenchimento */
    color: #fff;
    border-radius: 50%;
    transition: width 0.3s ease, height 0.3s ease;
    opacity: 0.5;
  }

  &:hover {
    color: #fff;
    background-color: #283B62;
  }

  &:hover:before {
    color: #fff;
    width: 50px;
    height: 50px;
  }
`;

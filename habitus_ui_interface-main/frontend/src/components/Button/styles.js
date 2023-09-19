import styled from 'styled-components';

const colors = {
  blue: {
    color: "#007BFF",
    hoverColor: "#006ee5",
  },
  green: {
    color: "#5CB85C",
    hoverColor: "#52a552",
  },
  red: {
    color: "#DC3545",
    hoverColor: "#c62f3e",
  },
  darkBlue: {
    color: "#283B62",
    hoverColor: "#202f4e"
  }
}

export const StyledButton = styled.button`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: ${props => props.color && colors[props.color].color};
  color: white;
  border: none;
  justify-content: center;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  gap: ${props => props.noGap ? 'none;' : '5px;'}

  &:hover {
    background-color: ${props => props.color && colors[props.color].hoverColor};
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
  }

`;


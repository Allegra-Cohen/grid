import { StyledButton } from "./styles";
import { Icon } from '@iconify/react';

function Button(props) {

  const { icon, label, color, onClick } = props

  return (
    <StyledButton color={color} label={label} onClick={onClick}>
        <Icon icon={icon} width="20" height="20" style={{ marginRight: 5 }} />
        {label}
    </StyledButton>
  );
}

export default Button;

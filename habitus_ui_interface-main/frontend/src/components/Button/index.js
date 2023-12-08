import { StyledButton } from "./styles";
import { Icon } from '@iconify/react';

function Button(props) {

  const { icon, label, color, onClick, noGap } = props

  return (
    <StyledButton color={color} label={label} onClick={onClick} noGap={noGap} >
        <Icon icon={icon} width="20" height="20" />
        {label}
    </StyledButton>
  );
}

export default Button;

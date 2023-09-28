import './styles.css'

function Header({ children }) {

  return (
    <div className="styled-header">
      {children}
    </div>
  );
}

export default Header;

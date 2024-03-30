import { useEffect, useState } from 'react';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';

function Navbar(){

  const [login, setLogin] = useState(false);

  useEffect(() => {
    if(window.localStorage.getItem("LogedIn") == "True"){
      setLogin(true)
    }
  }, [])

  return (
    <nav className="navbar">
      <Link to="/" className="nav-title">Pluto E-Learning</Link>
      <div className ="nav-items">
      <CustomLink to="/home" className="nav-simple">Home</CustomLink>
      <CustomLink to="/courses" className="nav-simple">Courses</CustomLink>
      <CustomLink to="/about" className="nav-simple">About Us</CustomLink>
      <CustomLink to="/contact" className="nav-simple">Contact Us</CustomLink>
      {
        login? 
        <>
        <CustomLink to="/profile" className="nav-sign">Profile</CustomLink>
        <div>
          <a className={"nav-sign"}
          style={{cursor: "pointer"}}
          onClick={(e) => {
            window.localStorage.setItem("LogedIn", "False");
            location.reload();
          }}>Sign Out</a> 
        </div>
        </>:
        <>
          <CustomLink to="/login" className="nav-login">Login</CustomLink>
          <CustomLink to="/sign" className="nav-sign">Sign In</CustomLink>
        </>
      }
      </div>
    </nav>
  );
};

function CustomLink({ to, children, ...props }) { 
    const resolvedPath = useResolvedPath(to);
    const isActive = useMatch({ path: resolvedPath.pathname, end: true });

    const islogin = to === '/login';
    const isSign = to === '/sign';

    let className = isActive ? "active" : "";
    if (islogin && isActive) {
      className += "-login"; 
    }
    else if (isSign && isActive) {
      className += "-sign"
    }

    return (
      <div className={className}>
        <Link to={to} {...props}>
          {children}
        </Link>
      </div>
    );
  }

export default Navbar;
import loginsideimage from "../assets/loginpageimage.png"

import axios from "../api/axios";
const LOGIN_URL = '/api/login';

import { useState, useRef, useEffect, useContext } from "react";
import  AuthContext from '../context/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';


export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const userRef = useRef();
  const errRef = useRef();
  const [errMsg, setErrMsg] = useState('');

  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');

  useEffect(() => {
    if(userRef.current != undefined){
      userRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setErrMsg('');
  }, [email, pwd])

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const response = await axios.post(LOGIN_URL, 
                JSON.stringify({ email, pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
          );
          if(response.data.status == "SUCCESS"){
            window.localStorage.setItem("LogedIn", "True");
            setEmail('');
            setPwd('');
            navigate("/home");
            location.reload();
          }else{
            setErrMsg('Incorrect information. User not found!')
          }
          // Handle response here (e.g., redirect to login)
      } catch (error) {
        if(!error?.response){
          setErrMsg('No Server Response')
        }
          console.error('Error during form submission', error);
      }
  };
  
  return (
    <div className = 'auth-pages'>
      <div className = 'auth-images'>
        <img src={loginsideimage} alt=""/> 
      </div>
      <div className="auth-real">
        <div className="auth-header">
            <div className="auth-text">Welcome Back!</div>
            <div className="auth-text-lower">Log in to start from where you left off  </div>
            <div className="auth-underline"></div>
        </div>
        <form onSubmit={handleSubmit}>
        <div className="auth-inputs">
          <div className="auth-input">
            <input className="auth-input-box"
                  autoComplete="off"
                  type="email" 
                  placeholder="Email" 
                  name="email"
                  required
                  onChange={(e) => setEmail(e.target.value)}/>
          </div>
        </div>
        <div className="auth-inputs">
          <div className="auth-input">
            <input className="auth-input-box" 
                  type="password"
                  placeholder="Password"
                  name="password"
                  required
                  onChange={(e) => setPwd(e.target.value)}/>
          </div>
        </div>
        <button type ="submit" className="auth-submit auth-blue">Login</button>
        </form>
        <Link to="/sign" className="auth-switch">Haven't Signed Up Yet? <span>Sign Up</span></Link>
      </div>
    </div>
  )
  }
import Navbar from './components/navbar';
import Home from "./pages/home";
import About from "./pages/about";
import Contact from "./pages/contact";
import Courses from "./pages/courses";
import Login from "./pages/login";
import Sign from "./pages/sign";
import { Route, Routes } from "react-router-dom";
import Footer from "./components/footer"
import Profile from './pages/profile';


function App() {
  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="content-wrap">
        <Routes>
          <Route path = "/" element = {<Home />} />
          <Route path = "/home" element = {<Home />} />
          <Route path = "/about" element = {<About />} />
          <Route path = "/courses" element = {<Courses />} />
          <Route path = "/about" element = {<About />} />
          <Route path = "/contact" element = {<Contact />} />
          <Route path = "/login" element = {<Login />} />
          <Route path = "/sign" element = {<Sign />} />
          <Route path = "/profile" element = {<Profile />} />
        </Routes>
      </div>
      </div>
      <Footer/>
    </div>
);}

export default App;

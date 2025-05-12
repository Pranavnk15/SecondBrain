
import { BrowserRouter,Route,Routes } from "react-router-dom"
import { Signup } from "./pages/Signup";
import { Signin } from "./pages/Signin"; // Importing the Signup page component
import { Dashboard } from "./pages/Dashboard"; // Importing the Dashboard page component
import Landing from "./pages/landing";
import { ShareBrain } from "./pages/ShareBrain";
import { AiSearch } from "./pages/AiSearch";

// Add route



function App() {
  

  return (  <BrowserRouter>
   <Routes>
    <Route path="/signup" element={<Signup />} />
    <Route path="/shareBrain/:hash" element={<ShareBrain />} />
    <Route path="/signin" element={<Signin />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/ai-search" element={<AiSearch />} />
    <Route path="*" element={<Landing />} />
   </Routes>
  </BrowserRouter>
  )
}

export default App

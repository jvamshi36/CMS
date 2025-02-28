import React from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import NeworgForm from "./pages/NeworgForm";
import Companies from "./pages/Companies";
import Orders from "./pages/Orders";
import Details from "./pages/Details";
import Login from "./components/Login/LoginPage";
import Team from "./pages/Team";
import NewOrder from "./pages/NewOrder";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard/>}/> {/* Changed from "/" to "/dashboard" */}
        <Route path="/new-org" element={<NeworgForm/>}/>
        <Route path="/new-order" element={<NewOrder/>}/>
        <Route path="/companies" element={<Companies/>}/>
        <Route path="/companies/:id/details" element={<Details/>}/> {/* Changed from companyId to id to match Details component */}
        <Route path="/companies/:companyId/orders" element={<Orders/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/team" element={<Team/>}/>
        <Route path="/" element={<Login/>}/> {/* Added default route to Login */}
      </Routes>
    </Router>
  );
}

export default App;

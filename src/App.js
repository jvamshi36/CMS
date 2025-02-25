import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NeworgForm from "./pages/NeworgForm";
import Companies from "./pages/Companies";
import Orders from "./pages/Orders";
import Details from "./pages/Details";
import Login from "./components/Login/LoginPage";
import Team from "./pages/Team";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/companies" />}/>
        <Route path= "/new-org" element = {<NeworgForm/>}/>
        <Route path="/companies" element={<Companies/>}/>
        <Route path="/companies/:companyId/details" element={<Details/>}/>
        <Route path="/companies/:companyId/orders" element={<Orders />}/>
        <Route path="/login" element = {<Login/>}/>
        <Route path="/team" element = {<Team/>}/>
      </Routes>
    </Router>
  );
}

export default App;

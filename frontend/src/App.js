import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import StoreCredentials from "./StoreCredentials";
import RetrieveCredentials from "./RetrieveCredentials";
import StoreDocuments from "./StoreDocuments";
import RetrieveDocuments from "./RetrieveDocuments";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/store-credentials" element={<StoreCredentials />} />
                <Route path="/retrieve-credentials" element={<RetrieveCredentials />} />
                <Route path="/store-documents" element={<StoreDocuments />} />
                <Route path="/retrieve-documents" element={<RetrieveDocuments />} />
        
            </Routes>
        </Router>
    );
}

export default App;

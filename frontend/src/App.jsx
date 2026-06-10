import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AppNav from "./components/AppNav";
import DataReference from "./pages/DataReference";
import Guide from "./pages/Guide";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Governance from "./pages/Governance";
import Workspace from "./pages/Workspace";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <AppNav />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/data-reference" element={<DataReference />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/home" element={<Navigate to="/workspace" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

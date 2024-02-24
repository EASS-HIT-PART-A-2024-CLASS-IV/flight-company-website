import Login from "pages/Login";
import Register from "pages/Register";
import { FunctionComponent } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { AdminRoutes, ProtectedRoutes } from "./protected.route";
import Home from "pages/Home";
import Flight from "pages/Flights";
import FlightBooking from "pages/Booking";

interface AppRoutesProps {}

const AppRoutes: FunctionComponent<AppRoutesProps> = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/home" element={<Home />} />
          <Route path="/buy" element={<FlightBooking />} />
        </Route>
        <Route element={<AdminRoutes />}>
          <Route path="/create-fight" element={<Flight />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

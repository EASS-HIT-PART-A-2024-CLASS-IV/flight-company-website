import ResponsiveAppBar from "components/ResponsiveAppBar";
import { FunctionComponent } from "react";
import { Outlet, Navigate, Routes } from "react-router-dom"; // Import Routes

const validateToken = (): boolean => {
  return sessionStorage.getItem("access") !== null; // Use '!=='
};

const validateAdmin = (): boolean => {
  return sessionStorage.getItem("role") === "admin";
};

interface ProtectedRoutesProps {}
const ProtectedRoutes: FunctionComponent<ProtectedRoutesProps> = () => {
  return validateToken() ? (
    <>
      <ResponsiveAppBar />
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" />
  );
};
interface AdminRoutesProps {}
const AdminRoutes: FunctionComponent<AdminRoutesProps> = () => {
  return validateToken() && validateAdmin() ? (
    <>
      <ResponsiveAppBar/>
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" />
  );
};

export { ProtectedRoutes, AdminRoutes };

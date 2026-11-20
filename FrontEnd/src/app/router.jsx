/*
 * TODO: Declare public routes and protected role-specific portal route trees.
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./navigation/routePaths";
import {RequireAuth, RequireRole} from "../lib/auth/guards.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import SignupPage from "../pages/SignupPage.jsx";
import ForbiddenPage from "../pages/ForbiddenPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import NotificationsPage from "../pages/NotificationsPage.jsx";

function Placeholder({title}){
    return <div style={{padding:24}}>
        <h1>{title}</h1>
        <p>Group 7 Task Coming Soon!</p>
    </div>;
}

export default function AppRouter() {

    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
            <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />

            <Route element={<RequireAuth />}>
            <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
            <Route path="/admin" element={<RequireRole allowed = {["admin"]}><Placeholder title="Admin Portal" /></RequireRole>} />
            <Route path="/doctor" element={<RequireRole allowed = {["doctor"]}><Placeholder title="Doctor Portal" /></RequireRole>} />
            <Route path="/patient" element={<RequireRole allowed = {["patient"]}><Placeholder title="Patient Portal" /></RequireRole>} />
            <Route path="/billing" element={<RequireRole allowed = {["billing"]}><Placeholder title="Billing Portal" /></RequireRole>} />
            
            </Route>

            <Route path="*" element={<NotFoundPage />} />

        </Routes>        
        </BrowserRouter>
    );
}
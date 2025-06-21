import { BrowserRouter, Route, Routes } from "react-router-dom";

import RootLayout from "@/layout/root";

import Applications from "@/pages/Applications";
import AuditLogs from "@/pages/AuditLogs";
import UserSettings from "@/pages/UserSettings";
import OrgSettings from "@/pages/OrgSettings";
import Users from "@/pages/Users";
import Callback from "@/pages/Callback";
import NotFound from "@/pages/NotFound";
import ApiKeys from "@/pages/ApiKeys";
import ProjectEnvironments from "@/pages/Projects";
import CreateProject from "@/pages/CreateProject";
import ManageEnvironment from "@/pages/ManageEnvironment";

export const Index = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<Callback />} />
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Applications />} />
          <Route path="applications" element={<Applications />} />
          <Route path="projects/create" element={<CreateProject />} />
          <Route path="projects/:projectNameId" element={<ProjectEnvironments />} />
          <Route path="projects/:projectNameId/manage-environments" element={<ManageEnvironment />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<UserSettings />} />
          <Route path="organisation" element={<OrgSettings />} />
          <Route path="audit" element={<AuditLogs />} />
          <Route path="apikeys" element={<ApiKeys />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Index;

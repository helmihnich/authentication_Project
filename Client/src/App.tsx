import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import Editor from "./components/Editor";
import Admin from "./components/Admin";
import Lounge from "./components/Lounge";
import Missing from "./components/Missing";
import Unauthorized from "./components/Unauthorized";
import LinkPage from "./components/LinkPage";
import RequireAuth from "./components/RequireAuth";
import { Routes, Route } from "react-router-dom";

const ROLES = {
  user: "user",
  editor: "editor",
  admin: "admin",
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* public routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="linkpage" element={<LinkPage />} />
        <Route path="unauthorized" element={<Unauthorized />} />

        {/* we want to protect these routes */}
        <Route
          element={
            <RequireAuth
              allowedRoles={[ROLES.user, ROLES.editor, ROLES.admin]}
            />
          }
        >
          <Route path="/" element={<Home />} />
        </Route>

        <Route element={<RequireAuth allowedRoles={[ROLES.editor]} />}>
          <Route path="editor" element={<Editor />} />
        </Route>

        <Route element={<RequireAuth allowedRoles={[ROLES.admin]} />}>
          <Route path="admin" element={<Admin />} />
        </Route>

        <Route
          element={<RequireAuth allowedRoles={[ROLES.editor, ROLES.admin]} />}
        >
          <Route path="lounge" element={<Lounge />} />
        </Route>

        {/* catch all */}
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}

export default App;

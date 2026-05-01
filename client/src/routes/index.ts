import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home.tsx";
import SignUp from "../pages/SignUp.tsx";
import SignIn from "../pages/SignIn.tsx";
import Dashboard from "../pages/Dashboard.tsx";
import Documents from "../components/Documents.tsx";
import Editor from "../pages/Editor.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/sign-up",
    Component: SignUp,
  },
  {
    path: "/sign-in",
    Component: SignIn,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
    children: [
      {
        index: true,
        Component: Documents,
      },
      {
        path: "edit/:docId",
        Component: Editor,
      }
    ],
  },
]);

export default router;
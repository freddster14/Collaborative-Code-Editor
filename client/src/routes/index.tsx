import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home.tsx";
import SignUp from "../pages/SignUp.tsx";
import SignIn from "../pages/SignIn.tsx";
import Dashboard from "../pages/Dashboard.tsx";
import Documents from "../components/Documents.tsx";
import Editor from "../pages/Editor.tsx";
import FolderData from "../components/Folder.tsx";
import { getRequest } from "../api/api-requests.ts";

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
    hydrateFallbackElement: <div className=" text-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">Loading...</div>,
    children: [
      {
        index: true,
        loader: async () =>  await getRequest("/folder"),
        Component: FolderData
      },
      {
        path: "folder/:folderId",
        loader: async ({ params }) => await getRequest(`/folder/${params.folderId}`),
        Component: FolderData
      },
      {
        path: 'recent',
        Component: Documents
      },
      {
        path: "edit/:docId",
        Component: Editor,
      },
    ],
  },
]);

export default router;
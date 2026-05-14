import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home.tsx";
import SignUp from "../pages/SignUp.tsx";
import SignIn from "../pages/SignIn.tsx";
import Dashboard from "../pages/Dashboard.tsx";
import Documents from "../components/Documents.tsx";
import Editor from "../pages/Editor.tsx";
import FolderData from "../components/Folder.tsx";
import { getRequest, getUser } from "../api/api-requests.ts";
import Intro from "../pages/Intro.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
    id: 'user',
    loader: async () =>  await getUser("/user"),
    children: [
      {
        index: true,
        Component: Intro
      },
      {
        path: "sign-up",
        Component: SignUp,
    
      },
      {
        path: "sign-in",
        Component: SignIn,
      },
      {
        path: "dashboard",
        id: "root",
        Component: Dashboard,
        hydrateFallbackElement: <div className=" text-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">Loading...</div>,
        children: [
          {
            index: true,
            loader: async () => {
              try {
                return await getRequest("/folder");

              } catch (error) {
                console.log(error)
              }
            },
            Component: FolderData
          },
          {
            path: "folder/:folderId",
            loader: async ({ params }) => {
              try {
                return await getRequest(`/folder/${params.folderId}`)

              } catch (error) {
                console.log(error)
              }
            },
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
    ]
  },
 
]);

export default router;
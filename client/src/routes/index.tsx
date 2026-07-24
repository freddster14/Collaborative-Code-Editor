import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home.tsx";
import SignUp from "../pages/SignUp.tsx";
import SignIn from "../pages/SignIn.tsx";
import Dashboard from "../pages/Dashboard.tsx";
import Documents from "../pages/Documents.tsx";
import Editor from "../pages/Editor.tsx";
import FolderData from "../pages/Folder.tsx";
import { getRequest, getUser } from "../api/api-requests.ts";
import Intro from "../pages/Intro.tsx";
import DocumentData from "../components/DocumentData.tsx";
import Loading from "../components/Loading.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
    id: 'user',
    loader: async () =>  await getUser("/user"),
    hydrateFallbackElement: <Loading />,
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
        hydrateFallbackElement: <Loading />,
        children: [
          {
            index: true,
            loader: async () => {
              try { return await getRequest("/folder") }
              catch (error) { console.error(error) }
            },
            Component: FolderData
          },
          {
            path: "folder/:folderId",
            loader: async ({ params }) => {
              try { return await getRequest(`/folder/${params.folderId}`) }
              catch (error) { console.error(error) }
            },
            Component: FolderData
          },
          {
            path: 'documents',
            Component: Documents,
            children: [
              {
                index: true,
                loader: async () => {
                  try { return await getRequest('/document') }
                  catch (error) { console.error(error) }
                },
                Component: DocumentData
              },
              {
                path: 'recent',
                loader: async () => {
                  try { return await getRequest('/document/recent') }
                  catch (error) { console.error(error) }
                },
                Component: DocumentData
              },
              {
                path: 'shared',
                loader: async () => {
                  try { return await getRequest('/document/shared') }
                  catch (error) { console.error(error) }
                },
                Component: DocumentData
              },
            ]
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
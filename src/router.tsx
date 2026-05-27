import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/ui/Layout";
import { Home } from "@/pages/Home";
import { Chapter } from "@/pages/Chapter";
import { Lesson } from "@/pages/Lesson";
import { Sandbox } from "@/pages/Sandbox";
import { Resources } from "@/pages/Resources";
import { Progress } from "@/pages/Progress";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "chapter/:id",
        element: <Chapter />,
      },
      {
        path: "lesson/:id",
        element: <Lesson />,
      },
      {
        path: "sandbox",
        element: <Sandbox />,
      },
      {
        path: "resources",
        element: <Resources />,
      },
      {
        path: "progress",
        element: <Progress />,
      },
    ],
  },
]);
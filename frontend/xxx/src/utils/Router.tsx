import { createBrowserRouter } from "react-router";
import App from "../App.tsx";

import Home from "../views/Home.tsx";
import About from "../views/About.tsx";

function Router() {
  return createBrowserRouter([
    {
      path: "/",
      element: <App />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/about", element: <About /> },
      ],
    },
  ]);
}

export default Router;

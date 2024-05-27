import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "@/assets/styles/main.sass";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Loading from "@/pages/Loading";
import CoinInsert from "@/pages/CoinInsert";
import Home from "@/pages/Home";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Loading />
    },
    {
        path: "/coin",
        element: <CoinInsert />
    },
    {
        path: "/error",
        element: <div>ERROR</div>
    },
    {
        path: "/home",
        element: <Home />
    },
    {
        path: "*",
        element: <Loading />
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
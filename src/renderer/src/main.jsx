import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "@/common/assets/styles/main.sass";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Loading from "@/pages/Loading";
import CoinInsert from "@/pages/CoinInsert";
import Home from "@/pages/Home";
import App from "@/common/layouts/App";
import GameSelect from "@/pages/GameSelect";
import Search from "@/pages/Search";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {path: "/", element: <Loading />},
            {path: "/coin", element: <CoinInsert />},
            {path: "/error", element: <h2>ERROR: Coin detector not connected</h2>},
            {path: "/home", element: <Home />},
            {path: "/game-select", element: <GameSelect />},
            {path: "/search", element: <Search />},
            {path: "*", element: <Loading />}
        ]
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
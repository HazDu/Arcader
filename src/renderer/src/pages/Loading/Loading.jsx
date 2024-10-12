import "./styles.sass";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";

export const Loading = () => {

    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            window.electron.send("connect-acceptor");

            window.electron.receive("acceptor-connected", (event, isConnected) => {
                navigate(isConnected ? "/coin" : "/error")
            });
        }, 1000);

        return () => {
            clearTimeout(timeout);
        }
    }, []);

    return (
        <div className="loading-page">
            <h1>LOADING...</h1>
        </div>
    )
}
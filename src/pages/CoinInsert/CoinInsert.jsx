import "./styles.sass";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

export const CoinInsert = () => {

    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            window.electron.receive("coin-detected", () => {
                navigate("/home");
            });
        }, 1000);

        return () => {
            clearTimeout(timeout);
        }
    }, []);

    return (
        <div className="insert-page">
            <h1>INSERT COIN</h1>
        </div>
    )
}
import "./styles.sass";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";

export const InGame = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            window.electron.receive("game-stopped", (event, coinSlotDisabled) => {
                navigate(coinSlotDisabled ? "/home" : "/coin");
            });
        }, 1000);

        return () => {
            clearTimeout(timeout);
        }
    }, []);

    return (
        <div className="game-page">
            <h1>GAME LOADING</h1>
        </div>
    )
}
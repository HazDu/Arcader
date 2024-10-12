import "./styles.sass";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import AcceptorImage from "./assets/acceptor.png";
import CoinImage from "./assets/coin.png";

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
            <div className="coin-animation">
                <img src={AcceptorImage} alt="Coin Acceptor" className="acceptor"/>
                <img src={CoinImage} alt="Coin" className="coin"/>
            </div>
            <h2 className="sub-text">Insert Coin to enter Game Library and choose a Game to play!</h2>
        </div>
    )
}
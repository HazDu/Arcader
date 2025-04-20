import "./styles.sass";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import AcceptorImage from "./assets/acceptor.png";
import CoinImage from "./assets/coin.png";

export const CoinInsert = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState({
        insertMessage: "INSERT COIN",
        infoMessage: "Insert Coin to enter Game Library and choose a Game to play!",
        konamiCodeEnabled: false
    });
    const [konamiSequence, setKonamiSequence] = useState([]);
    const KONAMI_CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const coinScreenConfig = await window.electron.getConfig('coinScreen');
                if (coinScreenConfig) {
                    setConfig(coinScreenConfig);
                }
            } catch (error) {
                console.error("Error loading coin screen config:", error);
            }
        };
        
        loadConfig();
    }, []);

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

    useEffect(() => {
        if (!config.konamiCodeEnabled) return;

        const handleKeyDown = (event) => {
            const newSequence = [...konamiSequence, event.code];

            if (newSequence.length > 10) {
                newSequence.shift();
            }
            
            setKonamiSequence(newSequence);

            if (newSequence.length === 10) {
                const isKonamiCode = newSequence.every(
                    (key, index) => key === KONAMI_CODE[index]
                );
                
                if (isKonamiCode) {
                    navigate("/home");
                }
            }
        };
        
        window.addEventListener("keydown", handleKeyDown);
        
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [config.konamiCodeEnabled, konamiSequence, navigate]);

    return (
        <div className="insert-page">
            <h1>{config.insertMessage}</h1>
            <div className="coin-animation">
                <img src={AcceptorImage} alt="Coin Acceptor" className="acceptor"/>
                <img src={CoinImage} alt="Coin" className="coin"/>
            </div>
            <h2 className="sub-text">{config.infoMessage}</h2>
        </div>
    )
}
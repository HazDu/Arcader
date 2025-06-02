import "./styles.sass";
import {useNavigate} from "react-router-dom";
import {useEffect, useState, useContext} from "react";
import AcceptorImage from "./assets/acceptor.png";
import CoinImage from "./assets/coin.png";
import {motion, AnimatePresence} from "framer-motion";
import {GameContext} from "@/common/contexts/GameContext";
import {generateDropShadowFromImageColor} from "@/common/utils/color";

export const CoinInsert = () => {
    const navigate = useNavigate();
    const {games} = useContext(GameContext);
    const [gamesWithShadow, setGamesWithShadow] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [config, setConfig] = useState({
        insertMessage: "INSERT COIN",
        infoMessage: "Insert Coin to enter Game Library and choose a Game to play!",
        konamiCodeEnabled: false,
        carouselSpeed: 1500
    });
    const [konamiSequence, setKonamiSequence] = useState([]);
    const KONAMI_CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const coinScreenConfig = await window.electron.getConfig('coinScreen');
                if (coinScreenConfig) {
                    setConfig(prevConfig => ({...prevConfig, ...coinScreenConfig}));
                }
            } catch (error) {
                console.error("Error loading coin screen config:", error);
            }
        };

        loadConfig();
    }, []);

    useEffect(() => {
        if (!games || games.length === 0) return;

        const setupGames = async () => {
            const gamesWithShadow = await Promise.all(
                games.map(async (game) => ({
                    ...game,
                    dropShadow: await generateDropShadowFromImageColor(game.thumbnail)
                }))
            );
            setGamesWithShadow(gamesWithShadow);
        };

        setupGames();
    }, [games]);

    useEffect(() => {
        if (!gamesWithShadow || gamesWithShadow.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex === gamesWithShadow.length - 1 ? 0 : prevIndex + 1));
        }, config.carouselSpeed);

        return () => clearInterval(interval);
    }, [gamesWithShadow, config.carouselSpeed]);

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

    const getVisibleGames = () => {
        if (!gamesWithShadow || gamesWithShadow.length === 0) return [];

        const prevIndex = currentIndex === 0 ? gamesWithShadow.length - 1 : currentIndex - 1;
        const nextIndex = currentIndex === gamesWithShadow.length - 1 ? 0 : currentIndex + 1;
        const farPrevIndex = prevIndex === 0 ? gamesWithShadow.length - 1 : prevIndex - 1;
        const farNextIndex = nextIndex === gamesWithShadow.length - 1 ? 0 : nextIndex + 1;

        return [
            {...gamesWithShadow[farPrevIndex], position: "far-prev"},
            {...gamesWithShadow[prevIndex], position: "prev"},
            {...gamesWithShadow[currentIndex], position: "current"},
            {...gamesWithShadow[nextIndex], position: "next"},
            {...gamesWithShadow[farNextIndex], position: "far-next"},
        ];
    };

    const variants = {
        "far-prev": {x: "-120%", scale: 0.4, opacity: 0, zIndex: 0},
        "prev": {x: "-110%", scale: 0.6, opacity: 0.7, zIndex: 1},
        "current": {x: "0%", scale: 1, opacity: 1, zIndex: 2},
        "next": {x: "70%", scale: 0.6, opacity: 0.7, zIndex: 1},
        "far-next": {x: "120%", scale: 0.4, opacity: 0, zIndex: 0},
    };

    return (
        <div className="insert-page">
            <h1>{config.insertMessage}</h1>
            <div className="coin-animation">
                <img src={AcceptorImage} alt="Coin Acceptor" className="acceptor"/>
                <img src={CoinImage} alt="Coin" className="coin"/>
            </div>

            <div className="game-carousel-container">
                <div className="game-carousel">
                    <AnimatePresence initial={false} mode="popLayout">
                        {getVisibleGames().map((game) => (
                            <motion.div key={`${game.id}-${game.position}`} className="carousel-item"
                                        variants={variants}
                                        initial="far-next"
                                        animate={game.position}
                                        exit="far-prev"
                                        transition={{
                                            x: {type: "spring", stiffness: 300, damping: 30},
                                            opacity: {duration: 0.2},
                                            scale: {duration: 0.2}
                                        }}>
                                <img src={game.thumbnail} alt={game.title}
                                     style={{
                                         filter: `drop-shadow(0 0 0.5rem ${game.dropShadow})`
                                     }}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {gamesWithShadow.length > 0 && (
                    <AnimatePresence mode="wait">
                        <motion.p key={gamesWithShadow[currentIndex].title} className="current-game-name"
                                  initial={{opacity: 0, y: 20}}
                                  animate={{opacity: 1, y: 0}}
                                  exit={{opacity: 0, y: -20}}
                                  transition={{duration: 0.2}}>
                            {gamesWithShadow[currentIndex].title}
                        </motion.p>
                    </AnimatePresence>
                )}
            </div>

            <h2 className="sub-text">{config.infoMessage}</h2>
        </div>
    )
}
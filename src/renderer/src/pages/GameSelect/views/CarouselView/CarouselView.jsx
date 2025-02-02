import {IconButton} from "../../../../common/components/IconButton/IconButton";
import ArrowLeftImage from "@/common/assets/img/arrow-left.png";
import ArrowRightImage from "@/common/assets/img/arrow-right.png";
import {generateDropShadowFromImageColor} from "@/common/utils/color";
import {useEffect, useState} from "react";
import {motion, AnimatePresence} from "framer-motion";
import "./styles.sass";

export const CarouselView = ({currentLevel, setCurrentLevel, data}) => {
    const [games, setGames] = useState([]);
    const [direction, setDirection] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const setupGames = async () => {
            const gamesWithShadow = await Promise.all(
                data.map(async (game) => ({
                    ...game,
                    dropShadow: await generateDropShadowFromImageColor(game.thumbnail)
                }))
            );
            setGames(gamesWithShadow);
        };
        setupGames();
    }, [data]);

    useEffect(() => {
        const onClick = (event, button) => {
            if (currentLevel === 3) {
                window.electron.send("load-game", games[currentIndex].id);
            }
        };

        const onJoystick = (event, axis) => {
            if (currentLevel === 3) {
                if (axis === "left") {
                    handlePrevious();
                } else if (axis === "right") {
                    handleNext();
                } else if (axis === "up") {
                    setCurrentLevel(1);
                }
            }
        }

        window.electron.receive("joystick-button", onClick);
        window.electron.receive("joystick-axis", onJoystick);

        return () => {
            if (currentLevel === 3) {
                window.electron.endReceiveAll("joystick-button");
                window.electron.endReceiveAll("joystick-axis");
            }
        };
    }, [currentLevel, currentIndex, games]);

    const handlePrevious = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev === 0 ? data.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev === data.length - 1 ? 0 : prev + 1));
    };

    const getVisibleGames = () => {
        if (games.length === 0) return [];

        const prevIndex = currentIndex === 0 ? games.length - 1 : currentIndex - 1;
        const nextIndex = currentIndex === games.length - 1 ? 0 : currentIndex + 1;
        const farPrevIndex = prevIndex === 0 ? games.length - 1 : prevIndex - 1;
        const farNextIndex = nextIndex === games.length - 1 ? 0 : nextIndex + 1;

        return [
            {...games[farPrevIndex], position: "far-prev"},
            {...games[prevIndex], position: "prev"},
            {...games[currentIndex], position: "current"},
            {...games[nextIndex], position: "next"},
            {...games[farNextIndex], position: "far-next"},
        ];
    };

    if (games.length === 0) return null;

    const variants = {
        "far-prev": {x: "-120%", scale: 0.4, opacity: 0, zIndex: 0,},
        "prev": {x: "-110%", scale: 0.6, opacity: 0.7, zIndex: 1,},
        "current": {x: "0%", scale: 1, opacity: 1, zIndex: 2,},
        "next": {x: "70%", scale: 0.6, opacity: 0.7, zIndex: 1,},
        "far-next": {x: "120%", scale: 0.4, opacity: 0, zIndex: 0,},
    };

    return (
        <div className="carousel-container">
            <div className="game-select-ui">
                <IconButton image={ArrowLeftImage}/>

                <div className="game-select-carousel">
                    <AnimatePresence initial={false} mode="popLayout">
                        {getVisibleGames().map((game) => (
                            <motion.div key={`${game.id}-${game.position}`} className="carousel-item"
                                        custom={direction} variants={variants}
                                        initial={direction > 0 ? "far-next" : "far-prev"} animate={game.position}
                                        exit={direction > 0 ? "far-prev" : "far-next"}
                                        transition={{
                                            x: {type: "spring", stiffness: 300, damping: 30},
                                            opacity: {duration: 0.2},
                                            scale: {duration: 0.2}
                                        }}>
                                <img src={game.thumbnail} alt={game.title}
                                     style={{
                                         filter: `drop-shadow(0 0 ${
                                             game.position === "current" && currentLevel === 3
                                                 ? "2rem"
                                                 : "0.5rem"
                                         } ${game.dropShadow})`
                                     }}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <IconButton image={ArrowRightImage}/>
            </div>

            <AnimatePresence mode="wait">
                <motion.p key={games[currentIndex].title} className="current-game-name"
                          initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                          exit={{opacity: 0, y: -20}} transition={{duration: 0.2}}>
                    {games[currentIndex].title}
                </motion.p>
            </AnimatePresence>
        </div>
    );
};
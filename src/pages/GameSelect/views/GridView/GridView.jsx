import { IconButton } from "../../../../common/components/IconButton/IconButton";
import ArrowDownImage from "@/common/assets/img/arrow-down.png";
import { useEffect, useState, useRef } from "react";
import { generateDropShadowFromImageColor } from "@/common/utils/color";
import "./styles.sass";

export const GridView = ({ currentLevel, setCurrentLevel, data }) => {
    const [currentGame, setCurrentGame] = useState(data[0]);
    const [gameData, setGameData] = useState(data);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const enhanceGameData = async () => {
            const enhancedData = await Promise.all(data.map(async (game) => ({
                ...game,
                dropShadow: await generateDropShadowFromImageColor(game.thumbnail),
            })));
            setGameData(enhancedData);
        };
        enhanceGameData();
    }, [data]);

    useEffect(() => {
        const scrollToIndex = (index) => {
            const rowHeight = 28;
            const scrollTop = Math.floor(index / 4) * rowHeight * 16;
            scrollContainerRef.current.scrollTo({ top: scrollTop, behavior: "smooth" });
        };

        const onJoystick = (event, axis) => {
            if (currentLevel !== 3) return;

            const currentIndex = data.findIndex(game => game.id === currentGame.id);
            let nextIndex = currentIndex;

            switch (axis) {
                case "left":
                    nextIndex = currentIndex % 4 === 0 ? currentIndex - 1 : currentIndex - 1;
                    break;
                case "right":
                    nextIndex = currentIndex % 4 === 3 ? currentIndex + 1 : currentIndex + 1;
                    break;
                case "up":
                    nextIndex = currentIndex - 4;
                    break;
                case "down":
                    nextIndex = currentIndex + 4;
                    break;
                default:
                    break;
            }

            if (nextIndex < 0) {
                nextIndex = 0;
                setCurrentLevel(2);
            }
            if (nextIndex >= data.length) nextIndex = data.length - 1;
            if (nextIndex !== currentIndex) {
                scrollToIndex(nextIndex);
                setCurrentGame(data[nextIndex]);
            }
        };

        window.electron.receive("joystick-axis", onJoystick);

        return () => {
            window.electron.endReceiveAll("joystick-axis");
        };
    }, [currentLevel, currentGame, data, setCurrentLevel]);

    if (!currentGame) return null;

    return (
        <>
            <p className="current-game-name">{currentGame.title}</p>
            <div className="game-select-grid-ui">
                <div className="game-select-grid" ref={scrollContainerRef}>
                    {gameData.map((game, index) => (
                        <img
                            className={game.id === currentGame.id ? "grid-selected" : ""}
                            key={index}
                            src={game.thumbnail}
                            alt={game.title}
                            style={{ filter: `drop-shadow(0 0 1rem ${game.dropShadow})` }}
                        />
                    ))}
                </div>
                <IconButton image={ArrowDownImage} />
            </div>
        </>
    );
};

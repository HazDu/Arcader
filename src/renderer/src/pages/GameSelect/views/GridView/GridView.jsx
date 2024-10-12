import { IconButton } from "@/common/components/IconButton/IconButton";
import ArrowDownImage from "@/common/assets/img/arrow-down.png";
import { useEffect, useState, useRef } from "react";
import { generateDropShadowFromImageColor } from "@/common/utils/color";
import "./styles.sass";

export const GridView = ({ currentLevel, setCurrentLevel, data, columns = 4 }) => {
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
            const scrollTop = Math.floor(index / columns) * rowHeight * 16;
            scrollContainerRef.current.scrollTo({ top: scrollTop, behavior: "smooth" });
        };

        const onJoystick = (event, axis) => {
            if (currentLevel !== 3) return;

            const currentIndex = data.findIndex(game => game.id === currentGame.id);
            let nextIndex = currentIndex;

            switch (axis) {
                case "left":
                    nextIndex = currentIndex % columns === 0 ? currentIndex - 1 : currentIndex - 1;
                    break;
                case "right":
                    nextIndex = currentIndex % columns === 3 ? currentIndex + 1 : currentIndex + 1;
                    break;
                case "up":
                    nextIndex = currentIndex - columns;
                    break;
                case "down":
                    nextIndex = currentIndex + columns;
                    break;
                default:
                    break;
            }

            if (nextIndex < 0) {
                nextIndex = 0;
                setCurrentLevel(columns === 4 ? 2 : 1);
            }
            if (nextIndex >= data.length) nextIndex = data.length - 1;
            if (nextIndex !== currentIndex) {
                scrollToIndex(nextIndex);
                setCurrentGame(data[nextIndex]);
            }
        };


        if (currentLevel === 3) {
            window.electron.receive("joystick-axis", onJoystick);
        }

        return () => {
            if (currentLevel === 3) {
                window.electron.endReceiveAll("joystick-axis");
            }
        };
    }, [currentLevel, currentGame, data, setCurrentLevel]);

    if (!currentGame) return null;

    return (
        <>
        {columns === 4 && <p className="current-game-name">{currentGame.title}</p>}
            <div className="game-select-grid-ui" style={{ width: columns === 4 ? "100%" : "60vw"}}>
                <div className="game-select-grid" ref={scrollContainerRef} style={{ gridTemplateColumns: `repeat(${columns || 4}, 1fr)`,
                    height: columns === 4 ? "45vh" : "70vh"}}>
                    {gameData.map((game, index) => (
                        <img
                            className={game.id === currentGame.id && currentLevel === 3 ? "grid-selected" : ""}
                            key={index}
                            src={game.thumbnail}
                            alt={game.title}
                            style={{ filter: `drop-shadow(0 0 1rem ${game.dropShadow})` }}
                        />
                    ))}
                </div>
                {columns === 4 && <IconButton image={ArrowDownImage} />}
            </div>
        </>
    );
};

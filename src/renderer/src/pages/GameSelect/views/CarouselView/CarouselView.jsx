import {IconButton} from "../../../../common/components/IconButton/IconButton";
import ArrowLeftImage from "@/common/assets/img/arrow-left.png";
import ArrowRightImage from "@/common/assets/img/arrow-right.png";
import {generateDropShadowFromImageColor} from "@/common/utils/color";
import {useEffect, useState} from "react";
import "./styles.sass";

export const CarouselView = ({currentLevel, setCurrentLevel, data}) => {

    const [currentGames, setCurrentGames] = useState({previous: {}, current: {}, next: {}});
    const [currentGame, setCurrentGame] = useState(data[0]);

    useEffect(() => {
        const onClick = (event, button) => {
            if (currentLevel === 3) {
                window.electron.send("load-game", currentGame.id);
            }
        }
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
        }
    }, [currentLevel]);

    useEffect(() => {
        getCurrentGames().then(setCurrentGames);
    }, [currentGame]);


    const getCurrentGames = async () => {
        const currentIndex = data.findIndex(game => game.id === currentGame.id);
        const previousIndex = currentIndex === 0 ? data.length - 1 : currentIndex - 1;
        const nextIndex = currentIndex === data.length - 1 ? 0 : currentIndex + 1;

        return {
            previous: {
                ...data[previousIndex],
                dropShadow: await generateDropShadowFromImageColor(data[previousIndex].thumbnail)
            },
            current: {...currentGame, dropShadow: await generateDropShadowFromImageColor(currentGame.thumbnail, true)},
            next: {
                ...data[nextIndex],
                dropShadow: await generateDropShadowFromImageColor(data[nextIndex].thumbnail)
            }
        };
    }

    const handlePrevious = () => {
        setCurrentGame(currentGame => {
            const currentIndex = data.findIndex(game => game.id === currentGame.id);
            const previousIndex = currentIndex === 0 ? data.length - 1 : currentIndex - 1;

            return data[previousIndex];
        });
    }

    const handleNext = () => {
        setCurrentGame(currentGame => {
            const currentIndex = data.findIndex(game => game.id === currentGame.id);
            const nextIndex = currentIndex === data.length - 1 ? 0 : currentIndex + 1;

            return data[nextIndex];
        });
    }


    if (!currentGames.previous || !currentGames.current || !currentGames.next) {
        return null;
    }

    return (
        <>
            <div className="game-select-ui">
                <IconButton image={ArrowLeftImage}/>

                <div className="game-select-carousel">
                    <img src={currentGames.previous.thumbnail} alt={currentGames.previous.title}
                         className="previous-game"
                         style={{filter: `drop-shadow(0 0 4rem ${currentGames.previous.dropShadow})`}}/>

                    <img src={currentGames.current.thumbnail} alt={currentGames.current.title}
                         className="current-game"
                         style={{filter: `drop-shadow(0 0 ${currentLevel === 3 ? "2rem" : "0.5rem"} ${currentGames.current.dropShadow})`}}/>

                    <img src={currentGames.next.thumbnail} alt={currentGames.next.title}
                         className="next-game"
                         style={{filter: `drop-shadow(0 0 4rem ${currentGames.next.dropShadow})`}}/>
                </div>

                <IconButton image={ArrowRightImage}/>
            </div>

            <p className="current-game-name">{currentGame.title}</p>
        </>
    )

}
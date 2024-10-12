import "./styles.sass";
import {IconButton} from "@/common/components/IconButton/IconButton";
import BackImage from "@/common/assets/img/back.png";
import SearchImage from "@/common/assets/img/search.png";
import GridViewImage from "@/common/assets/img/grid.png";
import CarouselImage from "@/common/assets/img/carousel.png";
import Button from "@/common/components/Button";
import {useContext, useEffect, useState} from "react";
import CarouselView from "@/pages/GameSelect/views/CarouselView";
import GridView from "@/pages/GameSelect/views/GridView";
import {useNavigate} from "react-router-dom";
import {GameContext} from "@/common/contexts/GameContext";

export const GameSelect = () => {

    const {games} = useContext(GameContext);

    const navigate = useNavigate();

    const [currentLevel, setCurrentLevel] = useState(3); // 0 = back, 1 = search, 2 = grid/carousel, 3 = game
    const [currentView, setCurrentView] = useState("carousel");

    useEffect(() => {
        const onClick = () => {
            if (currentLevel === 0) navigate("/home");
            if (currentLevel === 1) navigate("/search");

            if (currentLevel === 2) {
                setCurrentView(currentView => currentView === "carousel" ? "grid" : "carousel");
                setCurrentLevel(3);
            }
        }

        const onJoystick = (event, axis) => {
            if (currentLevel === 0 && axis === "down") {
                setCurrentLevel(1);
            }

            if (currentLevel === 1) {
                if (axis === "up") {
                    setCurrentLevel(0);
                } else if (axis === "right") {
                    setCurrentLevel(2);
                } else if (axis === "down") {
                    setCurrentLevel(3);
                } else if (axis === "left") {
                    setCurrentLevel(0);
                }
            }

            if (currentLevel === 2) {
                if (axis === "left") {
                    setCurrentLevel(1);
                } else if (axis === "down") {
                    setCurrentLevel(3);
                }
            }
        }

        const onGameLoaded = () => {
            navigate("/ingame");
        }

        window.electron.receive("game-loaded", onGameLoaded);
        window.electron.receive("joystick-axis", onJoystick);
        window.electron.receive("joystick-button", onClick);

        return () => {
            window.electron.endReceiveAll("game-loaded");
            window.electron.endReceiveAll("joystick-button");
            if (currentLevel !== 3) {
                window.electron.endReceiveAll("joystick-axis");
            }
        }
    }, [currentLevel]);

    if (!games) return null;

    return (
        <div className="game-select-page">
            <div className="top-area">
                <IconButton image={BackImage} selected={currentLevel === 0}/>
            </div>
            <div className="game-select-area">
                <div className="game-select-header">
                    <IconButton image={SearchImage} selected={currentLevel === 1}/>
                    <Button text="Select Game" padding="1"/>
                    <IconButton image={currentView === "carousel" ? GridViewImage : CarouselImage} selected={currentLevel === 2}/>
                </div>

                {currentView === "carousel" && <CarouselView currentLevel={currentLevel} setCurrentLevel={setCurrentLevel} data={games}/>}
                {currentView === "grid" && <GridView currentLevel={currentLevel} setCurrentLevel={setCurrentLevel} data={games}/>}
            </div>
        </div>
    );
}
import "./styles.sass";
import {IconButton} from "@/common/components/IconButton/IconButton";
import BackImage from "@/common/assets/img/back.png";
import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Keyboard from "@/pages/Search/elements/Keyboard";
import GridView from "@/pages/GameSelect/views/GridView";
import {GameContext} from "@/common/contexts/GameContext";

export const Search = () => {
    const navigate = useNavigate();

    const {games} = useContext(GameContext);

    const [search, setSearch] = useState("");
    const [underscore, setUnderscore] = useState("_");

    const [currentLevel, setCurrentLevel] = useState(0); // 0 = back, 1 = keypad, 3 = game

    useEffect(() => {
        const onClick = (event, button) => {
            if (currentLevel === 0) navigate("/home");
        }

        const onJoystick = (event, axis) => {
            if (currentLevel === 0 && axis === "down") {
                setCurrentLevel(1);
            }
        }

        window.electron.receive("joystick-axis", onJoystick);
        window.electron.receive("joystick-button", onClick);

        return () => {
            window.electron.endReceiveAll("joystick-button");
            if (currentLevel === 0) {
                window.electron.endReceiveAll("joystick-axis");
            }
        }
    }, [currentLevel]);

    useEffect(() => {
        const interval = setInterval(() => {
            setUnderscore(underscore === "_" ? " " : "_");
        }, 500);

        return () => clearInterval(interval);
    }, [underscore]);

    const getGamesBySearch = (search) => {
        if (!search) return games;
        return games.filter(game => game.title.toLowerCase().includes(search.toLowerCase()));
    }

    return (
        <div className="search-page">
            <div className="top-area">
                <IconButton image={BackImage} selected={currentLevel === 0}/>
            </div>
            <div className="game-search-area">
                <div className="game-search-header">
                    <h2>{search}{underscore}</h2>
                </div>

                <div className="game-search-ui">
                    <Keyboard setSearch={setSearch} currentLevel={currentLevel} setCurrentLevel={setCurrentLevel}/>

                    <GridView currentLevel={currentLevel} setCurrentLevel={setCurrentLevel} columns={3}
                              data={getGamesBySearch(search)}/>
                </div>

            </div>
        </div>
    );
}
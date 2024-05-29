import "./styles.sass";
import {IconButton} from "@/common/components/IconButton/IconButton";
import BackImage from "@/common/assets/img/back.png";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Keyboard from "@/pages/Search/elements/Keyboard";
import GridView from "@/pages/GameSelect/views/GridView";

const demoData = [
    {
        id: 1,
        title: "Super Mario 64",
        thumbnail: "/assets/demo/mario64.jpg"
    },
    {
        id: 2,
        title: "Super Mario Kart",
        thumbnail: "/assets/demo/mariokart.jpg"
    },
    {
        id: 3,
        title: "Super Smash Bros Melee",
        thumbnail: "/assets/demo/melee.jpg"
    },
    {
        id: 4,
        title: "Street Fighter II Turbo",
        thumbnail: "/assets/demo/streetfighter.jpg"
    },
    {
        id: 5,
        title: "Donkey Kong Country",
        thumbnail: "/assets/demo/donkeykong.jpg"
    },
    {
        id: 11,
        title: "Super Mario 64",
        thumbnail: "/assets/demo/mario64.jpg"
    },
    {
        id: 21,
        title: "Super Mario Kart",
        thumbnail: "/assets/demo/mariokart.jpg"
    },
    {
        id: 31,
        title: "Super Smash Bros Melee",
        thumbnail: "/assets/demo/melee.jpg"
    },
    {
        id: 41,
        title: "Street Fighter II Turbo",
        thumbnail: "/assets/demo/streetfighter.jpg"
    },
    {
        id: 51,
        title: "Donkey Kong Country",
        thumbnail: "/assets/demo/donkeykong.jpg"
    },
    {
        id: 12,
        title: "Super Mario 64",
        thumbnail: "/assets/demo/mario64.jpg"
    },
    {
        id: 22,
        title: "Super Mario Kart",
        thumbnail: "/assets/demo/mariokart.jpg"
    },
    {
        id: 32,
        title: "Super Smash Bros Melee",
        thumbnail: "/assets/demo/melee.jpg"
    },
    {
        id: 42,
        title: "Street Fighter II Turbo",
        thumbnail: "/assets/demo/streetfighter.jpg"
    },
    {
        id: 52,
        title: "Donkey Kong Country",
        thumbnail: "/assets/demo/donkeykong.jpg"
    }
]

export const Search = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [underscore, setUnderscore] = useState("_");

    const [currentLevel, setCurrentLevel] = useState(0); // 0 = back, 1 = keypad, 3 = game

    useEffect(() => {
        const onClick = (event, button) => {
            if (button !== 0) return;

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
        if (!search) return demoData;
        return demoData.filter(game => game.title.toLowerCase().includes(search.toLowerCase()));
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
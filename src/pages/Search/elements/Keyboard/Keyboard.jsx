import SpaceButtonImage from "./assets/space.png";
import BackButtonImage from "./assets/back.png";
import {useEffect, useState} from "react";
import KeyboardButton from "./components/KeyboardButton";
import "./styles.sass";

export const Keyboard = ({currentLevel, setCurrentLevel, setSearch}) => {

    const [currentLetter, setCurrentLetter] = useState(0);

    useEffect(() => {
        const onClick = (event, button) => {
            if (button !== 0) return;

            if (currentLevel === 1) {
                if (currentLetter === -1) {
                    setSearch(search => search.slice(0, -1));
                } else if (currentLetter === -2) {
                    setSearch(search => search + " ");
                    console.log(currentLetter)
                } else {
                    setSearch(search => search + "abcdefghijklmnopqrstuvwxyz1234567890"[currentLetter]);
                }
            }
        }

        const onJoystick = (event, axis) => {
            if (currentLevel === 1) {
                if (axis === "down") {
                    if (currentLetter < 30) {
                        setCurrentLetter(currentLetter === -2 ? 1 : currentLetter + 6);
                    }
                } else if (axis === "up") {
                    if (currentLetter < 6) {
                        if (currentLetter === -1 || currentLetter === -2) {
                            setCurrentLevel(0);
                        } else {
                            setCurrentLetter(currentLetter > 2 ? -1 : -2);
                        }
                    } else {
                        setCurrentLetter(currentLetter - 6);
                    }
                } else if (axis === "left") {
                    if (currentLetter % 6 !== 0 && currentLetter !== -1 && currentLetter !== -2) {
                        setCurrentLetter(currentLetter - 1);
                    }
                } else if (axis === "right") {
                    if (currentLetter % 6 === 5) {
                        setCurrentLevel(3);
                    } else if (currentLetter < 36) {
                        setCurrentLetter(currentLetter + 1);
                    }
                }
            }
        }

        window.electron.receive("joystick-axis", onJoystick);
        window.electron.receive("joystick-button", onClick);

        return () => {
            window.electron.endReceiveAll("joystick-axis");
            window.electron.endReceiveAll("joystick-button");
        }
    }, [currentLevel, currentLetter]);

    return (
        <div className="keyboard">
            <img src={SpaceButtonImage} alt="Space" className={"key-button " + (currentLetter === -2 ? "key-btn-selected" : "")}/>
            <img src={BackButtonImage} alt="Back" className={"key-button " + (currentLetter === -1 ? "key-btn-selected" : "")}/>

            {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890").map((letter, index) => (
                <KeyboardButton letter={letter} selected={index === currentLetter} key={index}/>
            ))}
        </div>
    )
}
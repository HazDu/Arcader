import "./styles.sass";
import Button from "@/common/components/Button";
import LogoImage from "./assets/logo.png";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

export const Home = () => {
    const [currentSelection, setCurrentSelection] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            window.electron.receive("joystick-axis", (event, axis) => {
                if (axis === "down") {
                    setCurrentSelection(current => current === 2 ? 0 : current + 1);
                } else if (axis === "up") {
                    setCurrentSelection(current => current === 0 ? 2 : current - 1);
                }
            });

            window.electron.receive("joystick-button", (event, button) => {
                if (button === 0) {
                    setCurrentSelection(current => {
                        if (current === 0)
                            navigate("/game-select");
                        else if (current === 1)
                            navigate("/game-select");
                        else if (current === 2)
                            navigate("/game-select");
                        return current;
                    });
                }
            });
        }, 1000);

        return () => {
            clearTimeout(timeout);
        }
    }, []);

    return (
        <div className="home-page">
            <img src={LogoImage} alt="Logo"/>
            <Button text="Quickplay" selected={currentSelection === 0}/>
            <Button text="Select Game" selected={currentSelection === 1}/>
            <Button text="Favorites" selected={currentSelection === 2}/>
        </div>
    );
}
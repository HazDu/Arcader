import {Outlet} from "react-router-dom";
import {useRef} from "react";
import {GameProvider} from "@/common/contexts/GameContext";

export default () => {
    const ref = useRef();

    return (
        <div className="app" ref={ref}>
            <GameProvider>
                <Outlet />
            </GameProvider>
        </div>
    )
}
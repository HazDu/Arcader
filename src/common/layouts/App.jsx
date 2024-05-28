import {Outlet} from "react-router-dom";
import {useRef} from "react";

export default () => {
    const ref = useRef();

    return (
        <div className="app" ref={ref}>
            <Outlet />
        </div>
    )
}
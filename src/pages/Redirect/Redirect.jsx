import {useNavigate} from "react-router-dom";

export const Redirect = () => {
    const navigate = useNavigate();

    navigate("/loading");

    return null;
}
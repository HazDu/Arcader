import React, {createContext, useEffect, useState} from "react";

export const GameContext = createContext(null);

export const GameProvider = ({children}) => {
    const [games, setGames] = useState([]);

    useEffect(() => {
        window.electron.receive("games-updated", (event, games) => {
            setGames(games);
        });
    }, []);

    return (
        <GameContext.Provider value={{games}}>
            {children}
        </GameContext.Provider>
    )
}
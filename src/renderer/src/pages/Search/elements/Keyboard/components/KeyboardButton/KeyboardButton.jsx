import "./styles.sass";

export const KeyboardButton = ({letter, selected}) => {
    return (
        <button className={"key-btn" + (selected ? " key-btn-selected" : "")}>{letter}</button>
    );
}
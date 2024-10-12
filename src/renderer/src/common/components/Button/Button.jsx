import "./styles.sass";

export const Button = ({text, selected, padding}) => {
    return (
        <button className={"btn" + (selected ? " btn-selected" : "") + (padding ? " btn-padding-" + padding : "")}>{text}</button>
    );
}
import "./styles.sass";

export const IconButton = ({image, selected}) => {
    return (
        <div className={"icon-btn" + (selected ? " btn-selected" : "")}>
            <img src={image} alt="Icon"/>
        </div>
    )
}
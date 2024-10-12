import ColorThief from "colorthief/dist/color-thief";

export const generateDropShadowFromImageColor = async (image) => {
    const colorThief = new ColorThief();

    const img = new Image();
    img.src = image;
    img.crossOrigin = "Anonymous";

    return new Promise((resolve) => {
        img.onload = () => {
            const dominantColor = colorThief.getColor(img);
            const dropShadow = `rgba(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]}, 1)`;

            resolve(dropShadow);
        }
    });
}
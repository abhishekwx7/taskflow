function hexToRgb(hex: string) {
    const clean = hex.replace("#", "");

    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);

    return { r, g, b };
}

export function getContrastTextColor(hex: string): string {
    const { r, g, b } = hexToRgb(hex);

    function linearize(value: number) {
        const channel = value / 255;

        return channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4;
    }

    const luminance =
        0.2126 * linearize(r) +
        0.7152 * linearize(g) +
        0.0722 * linearize(b);

    return luminance > 0.179 ? "#111318" : "#FFFFFF";
}
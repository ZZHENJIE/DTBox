interface IconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  size?: number | string;
  color?: string;
  radius?: number | string;
  spin?: boolean;
}

export function Icon({
  src,
  size = 20,
  color,
  radius = 10,
  spin = false,
  style,
  ...props
}: IconProps) {
  const sizeValue = typeof size === "number" ? `${size}px` : size;
  const radiusValue = typeof radius === "number" ? `${radius}px` : radius;

  return (
    <img
      src={src}
      width={size}
      height={size}
      style={{
        width: sizeValue,
        height: sizeValue,
        objectFit: "contain",
        display: "inline-block",
        verticalAlign: "middle",
        borderRadius: radiusValue,
        filter: color ? `drop-shadow(0 0 0 ${color})` : undefined,
        animation: spin ? "spin 1s linear infinite" : undefined,
        ...style,
      }}
      {...props}
    />
  );
}

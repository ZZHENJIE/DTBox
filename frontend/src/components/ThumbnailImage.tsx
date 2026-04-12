import { useState } from "react";
import { Box, Image, Skeleton, Center } from "@mantine/core";

interface ThumbnailImageProps {
  ticker: string;
  src: string;
  width?: number;
  maxHeight?: number;
  onClick?: () => void;
  onDoubleClick?: () => void;
  skeletonWidth?: number;
  skeletonHeight?: number;
}

export function ThumbnailImage({
  ticker,
  src,
  width,
  maxHeight,
  onClick,
  onDoubleClick,
  skeletonWidth,
  skeletonHeight,
}: ThumbnailImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Box
      pos="relative"
      style={{ width, maxHeight, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {!loaded && (
        <Skeleton height={skeletonHeight} width={skeletonWidth} radius="md" />
      )}
      <Center>
        <Image
          src={src}
          alt={ticker}
          radius="md"
          w={width}
          mah={maxHeight}
          onLoad={() => setLoaded(true)}
          style={{
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
        />
      </Center>
    </Box>
  );
}

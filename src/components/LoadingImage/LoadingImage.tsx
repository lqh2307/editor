import { Box, CircularProgress, Typography } from "@mui/material";
import { LoadingImageProp } from "./Types";
import React from "react";

export const LoadingImage = React.memo(
  ({
    display = "flex",
    fallbackSrc,
    src,
    alt,
    isLoading,
    progress = 0,
    isDisplayProgress,
    sx,
    ...prop
  }: LoadingImageProp): React.JSX.Element => {
    const [image, setimage] = React.useState<string>(undefined);

    React.useEffect(() => {
      setimage(src || fallbackSrc);
    }, [src, fallbackSrc]);

    const onErrorHandler = React.useCallback((): void => {
      setimage(fallbackSrc);
    }, [fallbackSrc]);

    return (
      <Box
        sx={{
          display: display,
          justifyContent: "center",
          alignItems: "center",
          ...prop,
          ...(sx ?? {}),
        }}
      >
        {isLoading ? (
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <CircularProgress
              color={"inherit"}
              variant={isDisplayProgress ? "determinate" : "indeterminate"}
              value={progress}
            />

            {isDisplayProgress && (
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant={"caption"} component={"div"}>
                  {`${progress}%`}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            component={"img"}
            src={image}
            alt={alt}
            sx={{
              width: "100%",
              height: "100%",
              backgroundImage: `repeating-conic-gradient(#eeeeee 0% 25%, #ffffff 0% 50%)`,
              backgroundSize: "25px 25px",
              objectFit: "contain",
            }}
            onError={onErrorHandler}
          />
        )}
      </Box>
    );
  }
);

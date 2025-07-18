import React from "react";

type Props = {
  zIndex?: number;
};

const Veil = ({ zIndex }: Props) => {
  return (
    <div
      style={{
        zIndex: zIndex ? zIndex : 50,
        position: "absolute",
        left: 0,
        right: 0,
        width: "100%",
        height: "100%",
        // background: "#0000004b",
      }}
    ></div>
  );
};

export default Veil;

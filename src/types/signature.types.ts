export type SignatureFontFamily =
  | "Style Script"
  | "Lavishly Your"
  | "Yellowtail"
  | "Borel"
  | "Playwrite IN"
  | "Send Flowers"
  | "Princess Sofia"
  | "Vibur";

export type SignatureFonts = {
  [key in SignatureFontFamily]: {
    fontSize?: number;
    fontWeight?: number;
  };
};

export type SignatureMode = "type" | "draw";

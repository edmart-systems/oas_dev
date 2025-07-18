import html2canvas from "html2canvas";

export const htmlToDatUrl = async (id: string): Promise<string> => {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Element with Id ${id} not found.`);
  }

  const canvas = await html2canvas(element, {
    scale: 1,
    // height: 320,
    // width: 550,
    // dpi: 144
  });
  const data = canvas.toDataURL("image/png");

  return Promise.resolve(data);
};

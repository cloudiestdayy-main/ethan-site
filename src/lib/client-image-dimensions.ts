export type ImageDimensions = {
  image_width: number | null;
  image_height: number | null;
};

export function readClientImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        image_width: image.naturalWidth || null,
        image_height: image.naturalHeight || null,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ image_width: null, image_height: null });
    };

    image.src = url;
  });
}

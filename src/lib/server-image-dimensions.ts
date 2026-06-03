import "server-only";

export type ParsedImageDimensions = {
  image_width: number;
  image_height: number;
};

function readUint24LE(bytes: Uint8Array, offset: number) {
  return bytes[offset] + (bytes[offset + 1] << 8) + (bytes[offset + 2] << 16);
}

function matchesAscii(bytes: Uint8Array, offset: number, value: string) {
  return Array.from(value).every((char, index) => bytes[offset + index] === char.charCodeAt(0));
}

function parsePngDimensions(bytes: Uint8Array, view: DataView): ParsedImageDimensions | null {
  if (
    bytes.length < 24 ||
    bytes[0] !== 0x89 ||
    !matchesAscii(bytes, 1, "PNG") ||
    !matchesAscii(bytes, 12, "IHDR")
  ) {
    return null;
  }

  const image_width = view.getUint32(16, false);
  const image_height = view.getUint32(20, false);
  return image_width && image_height ? { image_width, image_height } : null;
}

function parseGifDimensions(bytes: Uint8Array, view: DataView): ParsedImageDimensions | null {
  if (bytes.length < 10 || (!matchesAscii(bytes, 0, "GIF87a") && !matchesAscii(bytes, 0, "GIF89a"))) {
    return null;
  }

  const image_width = view.getUint16(6, true);
  const image_height = view.getUint16(8, true);
  return image_width && image_height ? { image_width, image_height } : null;
}

function parseJpegDimensions(bytes: Uint8Array, view: DataView): ParsedImageDimensions | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }

  let offset = 2;
  const startOfFrameMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);

  while (offset < bytes.length - 9) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    while (bytes[offset] === 0xff) offset += 1;
    const marker = bytes[offset];
    offset += 1;

    if (marker === 0xd9 || marker === 0xda) break;
    if (offset + 2 > bytes.length) break;

    const blockLength = view.getUint16(offset, false);
    if (blockLength < 2 || offset + blockLength > bytes.length) break;

    if (startOfFrameMarkers.has(marker) && blockLength >= 7) {
      const image_height = view.getUint16(offset + 3, false);
      const image_width = view.getUint16(offset + 5, false);
      return image_width && image_height ? { image_width, image_height } : null;
    }

    offset += blockLength;
  }

  return null;
}

function parseWebpDimensions(bytes: Uint8Array, view: DataView): ParsedImageDimensions | null {
  if (
    bytes.length < 30 ||
    !matchesAscii(bytes, 0, "RIFF") ||
    !matchesAscii(bytes, 8, "WEBP")
  ) {
    return null;
  }

  const chunkType = String.fromCharCode(bytes[12], bytes[13], bytes[14], bytes[15]);

  if (chunkType === "VP8X" && bytes.length >= 30) {
    const image_width = readUint24LE(bytes, 24) + 1;
    const image_height = readUint24LE(bytes, 27) + 1;
    return image_width && image_height ? { image_width, image_height } : null;
  }

  if (chunkType === "VP8L" && bytes.length >= 25) {
    const b0 = bytes[21];
    const b1 = bytes[22];
    const b2 = bytes[23];
    const b3 = bytes[24];
    const image_width = 1 + (((b1 & 0x3f) << 8) | b0);
    const image_height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
    return image_width && image_height ? { image_width, image_height } : null;
  }

  if (chunkType === "VP8 " && bytes.length >= 30) {
    const image_width = view.getUint16(26, true) & 0x3fff;
    const image_height = view.getUint16(28, true) & 0x3fff;
    return image_width && image_height ? { image_width, image_height } : null;
  }

  return null;
}

export function parseImageDimensions(buffer: ArrayBuffer): ParsedImageDimensions | null {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  return (
    parsePngDimensions(bytes, view) ||
    parseGifDimensions(bytes, view) ||
    parseJpegDimensions(bytes, view) ||
    parseWebpDimensions(bytes, view)
  );
}

export async function fetchImageDimensions(url: string) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Immagine non leggibile (${response.status}).`);
  }

  return parseImageDimensions(await response.arrayBuffer());
}

export const CARD_DEFAULT_SIZES = {
  sticky: { width: 168, height: 148 },
  torn: { width: 190, height: 130 },
  index: { width: 210, height: 140 },
  envelope: { width: 190, height: 120 },
  textured: { width: 180, height: 220 },
  sticker: { width: 72, height: 72 },
};

export function getCardSize(note) {
  const key = note.style === 'sticker'
    ? 'sticker'
    : note.paperTexture
      ? 'textured'
      : note.style;
  const defaults = CARD_DEFAULT_SIZES[key] || CARD_DEFAULT_SIZES.sticky;
  return {
    width: note.width ?? defaults.width,
    height: note.height ?? defaults.height,
  };
}

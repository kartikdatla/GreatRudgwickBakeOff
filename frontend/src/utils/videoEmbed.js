/**
 * Convert YouTube/Vimeo URLs into embeddable iframe URLs
 * with autoplay and mute parameters.
 */

export const getEmbedUrl = (url) => {
  if (!url) return null;

  const trimmed = url.trim();

  // YouTube: youtube.com/watch?v=ID or youtube.com/watch?v=ID&t=30
  const ytWatch = trimmed.match(/(?:youtube\.com\/watch\?v=)([\w-]+)/);
  if (ytWatch) {
    return `https://www.youtube.com/embed/${ytWatch[1]}?autoplay=1&mute=1&rel=0`;
  }

  // YouTube: youtu.be/ID
  const ytShort = trimmed.match(/(?:youtu\.be\/)([\w-]+)/);
  if (ytShort) {
    return `https://www.youtube.com/embed/${ytShort[1]}?autoplay=1&mute=1&rel=0`;
  }

  // YouTube: youtube.com/embed/ID (already embed format)
  const ytEmbed = trimmed.match(/(?:youtube\.com\/embed\/)([\w-]+)/);
  if (ytEmbed) {
    return `https://www.youtube.com/embed/${ytEmbed[1]}?autoplay=1&mute=1&rel=0`;
  }

  // Vimeo: vimeo.com/ID
  const vimeo = trimmed.match(/(?:vimeo\.com\/)([\d]+)/);
  if (vimeo) {
    return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&muted=1`;
  }

  // Vimeo: player.vimeo.com/video/ID (already embed format)
  const vimeoEmbed = trimmed.match(/(?:player\.vimeo\.com\/video\/)([\d]+)/);
  if (vimeoEmbed) {
    return `https://player.vimeo.com/video/${vimeoEmbed[1]}?autoplay=1&muted=1`;
  }

  return null;
};

export const isValidVideoUrl = (url) => {
  if (!url) return false;
  return getEmbedUrl(url) !== null;
};

const FALLBACK_ROOM_IMAGE = "/static/mount1.jpg";

const toSlug = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const toRoomSlug = (value = "") => toSlug(value);

export const buildAssetUrl = (path) => {
  if (!path) return FALLBACK_ROOM_IMAGE;
  if (/^https?:\/\//i.test(path)) return path;

  const cloudBase = import.meta.env.VITE_CLOUDINARY_CLOUD || "";

  if (path.startsWith("/static/")) {
    return path;
  }

  if (!cloudBase) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  if (path.startsWith("/")) {
    return `${cloudBase}${path}`;
  }

  return `${cloudBase}${cloudBase.endsWith("/") ? "" : "/"}${path}`;
};

const applyCloudinaryTransforms = (url, transformations = "") => {
  if (!transformations || !url.includes("/upload/")) {
    return url;
  }

  return url.replace("/upload/", `/upload/${transformations}/`);
};

const uniqueImages = (images = []) => {
  const seen = new Set();

  return images.filter((image) => {
    if (!image || seen.has(image)) {
      return false;
    }

    seen.add(image);
    return true;
  });
};

export const buildResponsiveRoomImageUrl = (
  path,
  { width = 720, height = 540, crop = "fill" } = {}
) => {
  const assetUrl = buildAssetUrl(path);
  const transformations = `f_auto,q_auto,c_${crop},w_${width},h_${height},g_auto,dpr_auto`;

  return applyCloudinaryTransforms(assetUrl, transformations);
};

export const getRoomGalleryImages = (room = {}, { includeFallback = true } = {}) => {
  const normalizedRoom = normalizeRoom(room);

  if (!includeFallback && !normalizedRoom.hasRoomImages) {
    return [];
  }

  return normalizedRoom.gallery;
};

export const buildRoomCardImageUrl = (path) =>
  buildResponsiveRoomImageUrl(path, {
    width: 900,
    height: 620,
  });

export const normalizeRoom = (room = {}) => {
  const rawGallery = Array.isArray(room.gallery) ? uniqueImages(room.gallery) : [];
  const fallbackGallery = uniqueImages([room.coverImage, room.image]);
  const gallery = rawGallery.length > 0 ? rawGallery : fallbackGallery;
  const roomName = room.roomName || room.name || "Room";
  const roomType = room.roomType || room.id || toSlug(roomName) || "room";
  const maxAdults = room.maxAdults ?? room.maxGuests ?? 1;
  const coverImage = gallery[0] || FALLBACK_ROOM_IMAGE;
  const hasRoomImages = gallery.length > 0;

  return {
    ...room,
    roomType,
    roomName,
    price: Number(room.price) || 0,
    description: room.description || "",
    amenities: Array.isArray(room.amenities) ? room.amenities : [],
    maxAdults,
    totalRooms: room.totalRooms ?? 0,
    availableRooms: room.availableRooms,
    gallery: gallery.length > 0 ? gallery : [FALLBACK_ROOM_IMAGE],
    coverImage,
    hasRoomImages,
  };
};

export const normalizeRooms = (rooms) =>
  Array.isArray(rooms) ? rooms.map((room) => normalizeRoom(room)) : [];

export const getFallbackRoomImage = () => FALLBACK_ROOM_IMAGE;

export const findRoomByIdentifier = (rooms = [], identifier = "") => {
  const decodedIdentifier = decodeURIComponent(identifier || "");
  const normalizedIdentifier = toSlug(decodedIdentifier);

  return rooms.find((rawRoom) => {
    const room = normalizeRoom(rawRoom);

    return [
      room.roomType,
      room.id,
      room.roomName,
      toSlug(room.roomType),
      toSlug(room.id),
      toSlug(room.roomName),
    ]
      .filter(Boolean)
      .some((candidate) => {
        const normalizedCandidate = toSlug(candidate);
        return candidate === decodedIdentifier || normalizedCandidate === normalizedIdentifier;
      });
  });
};

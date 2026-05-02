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

export const normalizeRoom = (room = {}) => {
  const rawGallery = Array.isArray(room.gallery) ? room.gallery.filter(Boolean) : [];
  const fallbackGallery = [room.coverImage, room.image].filter(Boolean);
  const gallery = rawGallery.length > 0 ? rawGallery : fallbackGallery;
  const roomName = room.roomName || room.name || "Room";
  const roomType = room.roomType || room.id || toSlug(roomName) || "room";
  const maxAdults = room.maxAdults ?? room.maxGuests ?? 1;
  const coverImage = gallery[0] || FALLBACK_ROOM_IMAGE;

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

import Cart_item from "../models/cart.js";
import { calculateRoomAvailability } from "../utils/roomAvailability.js";
import Room from "../models/room.js";
import {
  getKolkataTodayString,
  normalizeToKolkataDateString,
  calculateNights,
  isPositiveInteger,
} from "../utils/dateUtils.js";

export const addToCart = async (req, res) => {
  try {
    const { members, checkIn, checkOut, roomType, quantity } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!isPositiveInteger(quantity)) {
      return res.status(400).json({ message: "Quantity must be a positive integer" });
    }

    if (!isPositiveInteger(members)) {
      return res.status(400).json({ message: "Members count must be a positive integer" });
    }

    const normCheckIn = normalizeToKolkataDateString(checkIn);
    const normCheckOut = normalizeToKolkataDateString(checkOut);
    if (!normCheckIn || !normCheckOut) {
      return res.status(400).json({ message: "Invalid date format. Expected YYYY-MM-DD" });
    }

    const todayKolkata = getKolkataTodayString();
    if (normCheckIn < todayKolkata) {
      return res.status(400).json({ message: "Check-in date cannot be in the past" });
    }

    const nights = calculateNights(normCheckIn, normCheckOut);
    if (isNaN(nights) || nights <= 0) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    const room = await Room.findOne({ roomType });
    if (!room) {
      return res.status(404).json({ message: "Room type not found" });
    }

    // Guest capacity check: Fail closed if maxAdults is missing or invalid
    const maxAdults = room.maxAdults ?? room._doc?.maxAdults;
    if (typeof maxAdults !== "number" || maxAdults <= 0) {
      return res.status(400).json({ message: "Invalid room capacity configuration" });
    }

    if (members > maxAdults * quantity) {
      return res.status(400).json({
        message: `Too many guests. Maximum allowed for ${quantity} room(s) is ${maxAdults * quantity}`,
      });
    }

    const availability = await calculateRoomAvailability(
      normCheckIn,
      normCheckOut,
      userId
    );

    if (!availability[roomType] || availability[roomType].availableRooms <= 0) {
      return res.status(400).json({ message: "No rooms available" });
    }
    if (availability[roomType].availableRooms < quantity) {
      return res.status(400).json({
        message:
          "only " + availability[roomType].availableRooms + " rooms available",
      });
    }

    const prevItem = await Cart_item.findOne({
      userId,
      roomType,
      checkIn: normCheckIn,
      checkOut: normCheckOut,
    });
    if (prevItem) {
      const combinedQuantity = prevItem.quantity + quantity;
      const combinedMembers = prevItem.members + members;
      if (combinedMembers > maxAdults * combinedQuantity) {
        return res.status(400).json({
          message: `Too many guests for combined room count of ${combinedQuantity}`,
        });
      }
      prevItem.quantity = combinedQuantity;
      prevItem.members = combinedMembers;
      await prevItem.save();
      return res.json({ message: "Item already in cart" });
    }
    const cartItem = new Cart_item({
      userId,
      members,
      checkIn: normCheckIn,
      checkOut: normCheckOut,
      roomType,
      quantity,
    });
    await cartItem.save();
    return res.status(201).json({ message: "Item added to cart" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error adding item to cart" });
  }
};

export const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const cartItems = await Cart_item.find({ userId });
    const removed = [];
    const available = [];
    let price = 0;

    for (const item of cartItems) {
      const availability = await calculateRoomAvailability(
        item.checkIn,
        item.checkOut,
        userId,
        item._id
      );
      const roomType = item.roomType;
      const checkIn = new Date(item.checkIn);
      const checkOut = new Date(item.checkOut);
      const days = Math.round((checkOut - checkIn) / (1000 * 3600 * 24));
      if (availability[roomType].availableRooms < item.quantity) {
        const curr = item.quantity;
        item.quantity = availability[roomType].availableRooms;
        item.members = Math.min(
          item.members,
          item.quantity * availability[roomType].maxAdults
        );

        if (item.quantity === 0) {
          await Cart_item.deleteOne({ _id: item._id });
        } else {
          await item.save();
        }
        const itemPrice = parseFloat(
          days *
            (availability[roomType].price -
              availability[roomType].price * availability[roomType].discount)
        );
        removed.push({
          roomType,
          removedQuantity: curr - availability[roomType].availableRooms,
          checkIn: item.checkIn,
          checkOut: item.checkOut,
          price: itemPrice,
          discount: availability[roomType].discount,
          members: item.members,
        });

        if (availability[roomType].availableRooms > 0) {
          available.push({
            roomType,
            quantity: availability[roomType].availableRooms,
            checkIn: item.checkIn,
            checkOut: item.checkOut,
            price: itemPrice,
            discount: availability[roomType].discount,
            members: item.members,
          });
        }
        price += itemPrice;
      } else {
        const itemPrice = parseFloat(
          days *
            (availability[roomType].price -
              availability[roomType].price * availability[roomType].discount)
        );
        available.push({
          roomType,
          quantity: item.quantity,
          checkIn: item.checkIn,
          checkOut: item.checkOut,
          price: itemPrice,
          discount: availability[roomType].discount,
          members: item.members,
        });
        price += itemPrice;
      }
    }

    const cart = [...removed, ...available];
    return res.status(200).json({
      cart,
      removed,
      available,
      message: "Cart items checked and updated successfully",
      price,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching cart items" });
  }
};

export const changeMember = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const { roomType, members, checkIn, checkOut } = req.body;
    if (!roomType || !checkIn || !checkOut) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!isPositiveInteger(members)) {
      return res.status(400).json({ message: "Members count must be a positive integer" });
    }

    const normCheckIn = normalizeToKolkataDateString(checkIn) || checkIn;
    const normCheckOut = normalizeToKolkataDateString(checkOut) || checkOut;

    const cartItem = await Cart_item.findOne({
      userId,
      roomType,
      checkIn: normCheckIn,
      checkOut: normCheckOut,
    });
    const room = await Room.findOne({ roomType });
    if (!cartItem) {
      return res
        .status(404)
        .json({ message: "Cart item not found for the given criteria." });
    }
    if (!room) {
      return res.status(404).json({ message: "Room type not found" });
    }

    const maxAdults = room.maxAdults ?? room._doc?.maxAdults;
    if (typeof maxAdults !== "number" || maxAdults <= 0) {
      return res.status(400).json({ message: "Invalid room capacity configuration" });
    }

    if (members > maxAdults * cartItem.quantity) {
      return res
        .status(400)
        .json({ message: `Maximum number of adults exceeded (${maxAdults * cartItem.quantity} max).` });
    }
    cartItem.members = members;
    await cartItem.save();
    return res.status(200).json({
      message: "Room members updated successfully.",
      cartItem,
    });
  } catch (error) {
    console.error("Error updating room quantity:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const deletefromCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const { roomType, checkIn, checkOut } = req.body;
    const cartItem = await Cart_item.findOne({
      userId,
      roomType,
      checkIn,
      checkOut,
    });
    if (!cartItem) {
      return res
        .status(404)
        .json({ message: "Cart item not found for the given criteria ." });
    }
    await cartItem.deleteOne();
    return res
      .status(200)
      .json({ message: "Item removed from cart successfully." });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const updateCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { updates } = req.body; // Expecting an array of updates with roomType, quantity, checkIn, and checkOut
    if (!userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const updatedItems = [];
    const notUpdated = [];
    const deletedItems = [];

    for (const update of updates) {
      const { members, roomType, quantity, checkIn, checkOut } = update;

      if (quantity === 0) {
        // If quantity is 0, delete the cart item
        const deleted = await Cart_item.findOneAndDelete({
          userId,
          roomType,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
        });

        if (deleted) {
          deletedItems.push({
            roomType,
            message: "Cart item deleted successfully",
          });
        } else {
          notUpdated.push({
            roomType,
            message: "Cart item not found for deletion",
          });
        }

        continue;
      }

      const availability = await calculateRoomAvailability(checkIn, checkOut);

      if (!availability[roomType]) {
        notUpdated.push({
          roomType,
          quantity,
          message: "Invalid room type or no availability data found",
        });
        continue;
      }

      if (availability[roomType].availableRooms < quantity) {
        notUpdated.push({
          roomType,
          requestedQuantity: quantity,
          availableRooms: availability[roomType].availableRooms,
          message: "Not enough rooms available",
        });
        continue;
      }

      const cartItem = await Cart_item.findOne({
        userId,
        roomType,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
      });

      if (!cartItem) {
        notUpdated.push({
          roomType,
          message: "Cart item not found for update",
        });
        continue;
      }

      cartItem.quantity = quantity;
      cartItem.members = members;
      await cartItem.save();

      updatedItems.push({
        roomType,
        quantity: cartItem.quantity,
        checkIn: cartItem.checkIn,
        checkOut: cartItem.checkOut,
        message: "Cart item updated successfully",
      });
    }

    return res.status(200).json({
      updatedItems,
      deletedItems,
      notUpdated,
      message: "Cart updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating cart items" });
  }
};

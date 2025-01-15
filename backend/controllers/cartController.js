import Cart_item from "../models/cart.js";
import { calculateRoomAvailability } from "../utils/roomAvailability.js";
import Room from "../models/room.js";

export const addToCart = async (req, res) => {
    try {
        const { members, checkIn, checkOut, roomType, quantity } = req.body;
        console.log(members, checkIn, checkOut, roomType, quantity);
        const userId = req.user.id;
        const availability = await calculateRoomAvailability(checkIn, checkOut);
        const room = await Room.findOne({ roomType });
        if (room.maxAdults < members) {
            return res.status(400).json({ message: "Too many adults" });
        }
        if (availability[roomType].availableRooms <= 0) {
            return res.status(400).json({ message: "No rooms available" });
        }
        if (availability[roomType].availableRooms < quantity) {
            return res.status(400).json({ message: "only" + availability[roomType].availableRooms + "rooms available" });
        }
        const cartItem = new Cart_item({
            userId,
            members,
            checkIn,
            checkOut,
            roomType,
            quantity
        });
        await cartItem.save();
        return res.status(201).json({ message: "Item added to cart" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error adding item to cart" });
    }
}

export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItems = await Cart_item.find({ userId });
        const removed = [];
        const available = [];
        let price = 0;
        for (const item of cartItems) {
            const availability = await calculateRoomAvailability(item.checkIn, item.checkOut);
            const roomType = item.roomType;
            console.log(item);
            if (availability[roomType].availableRooms < item.quantity) {
                item.quantity = availability[roomType].availableRooms;
                await item.save();
                removed.push({ roomType, updatedQuantity: item.quantity, checkIn: item.checkIn, checkOut: item.checkOut, price: availability[roomType].price, discount: availability[roomType].discount });
            } else {
                available.push({ roomType, quantity: item.quantity, checkIn: item.checkIn, checkOut: item.checkOut, price: availability[roomType].price, discount: availability[roomType].discount });
            }
            price += item.quantity * (item.price - (item.price * item.discount));
        }
        const cart = [...removed , ...available];
        return res.status(200).json({
            cart,
            removed,
            available,
            message: "Cart items checked and updated successfully",
            price: price
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error fetching cart items" });
    }
};

export const updateCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { updates } = req.body; // Expecting an array of updates with roomType, quantity, checkIn, and checkOut

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

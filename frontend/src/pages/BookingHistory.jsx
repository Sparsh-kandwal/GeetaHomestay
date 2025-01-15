// frontend/src/pages/BookingHistory.jsx

import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../auth/Userprovider";
import Modal from "../components/Modal";
import { FaSearch, FaSort, FaSortUp, FaSortDown, FaEye } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// SortableHeader Component
const SortableHeader = ({ label, sortKey, sortConfig, onSort }) => {
  return (
    <th
      className="py-3 px-6 bg-indigo-600 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center">
        <span>{label}</span>
        <SortIcon sortConfig={sortConfig} keyName={sortKey} />
      </div>
    </th>
  );
};

// SortIcon Component
const SortIcon = ({ sortConfig, keyName }) => {
  if (sortConfig.key !== keyName) {
    return <FaSort className="ml-1 text-sm" />;
  }
  return sortConfig.direction === "asc" ? (
    <FaSortUp className="ml-1 text-sm" />
  ) : (
    <FaSortDown className="ml-1 text-sm" />
  );
};

// DetailRow Component for Modal
const DetailRow = ({ label, value }) => (
  <div className="flex">
    <span className="w-32 font-semibold text-gray-700">{label}:</span>
    <span className="text-gray-600">{value}</span>
  </div>
);

const BookingHistory = () => {
  const { user, isLoading: userLoading } = useContext(UserContext);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: "checkIn", direction: "asc" });

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;

  useEffect(() => {
    if (!user) {
      setError("You must be logged in to view your booking history.");
      setIsLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/bookings`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bookings.");
        }

        const data = await response.json();
        setBookings(data.bookings);
        setFilteredBookings(data.bookings);
      } catch (err) {
        setError(err.message || "An error occurred while fetching bookings.");
        toast.error(err.message || "Failed to fetch bookings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  // Handle Sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    let sortedBookings = [...filteredBookings];
    if (sortConfig.key) {
      sortedBookings.sort((a, b) => {
        if (sortConfig.key === "checkIn" || sortConfig.key === "checkOut") {
          return sortConfig.direction === "asc"
            ? new Date(a[sortConfig.key]) - new Date(b[sortConfig.key])
            : new Date(b[sortConfig.key]) - new Date(a[sortConfig.key]);
        } else {
          if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
          if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }
      });
      setFilteredBookings(sortedBookings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortConfig]);

  // Handle Search
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = bookings.filter(
      (booking) =>
        booking._id.toLowerCase().includes(query) ||
        booking.roomName.toLowerCase().includes(query) ||
        booking.status.toLowerCase().includes(query)
    );
    setFilteredBookings(filtered);
    setCurrentPage(1);
  };

  // Pagination Logic
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setIsModalOpen(false);
  };

  if (isLoading || userLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
        <p className="text-red-500 text-xl mb-4">{error}</p>
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 mt-16">
      <h2 className="text-4xl font-bold mb-6 text-indigo-700 text-center">Your Booking History</h2>

      {/* Search Bar */}
      <div className="flex justify-end mb-4">
        <div className="relative w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <FaSearch />
          </span>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <p className="text-center text-gray-500">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden table-fixed">
            <colgroup>
              <col className="w-1/6" /> {/* Booking ID */}
              <col className="w-1/6" /> {/* Room */}
              <col className="w-1/6" /> {/* Check-In */}
              <col className="w-1/6" /> {/* Check-Out */}
              <col className="w-1/6" /> {/* Status */}
              <col className="w-1/6" /> {/* Actions */}
            </colgroup>
            <thead>
              <tr>
                {/* Table Headers with Sorting */}
                <SortableHeader
                  label="Booking ID"
                  sortKey="_id"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Room"
                  sortKey="roomName"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Check-In"
                  sortKey="checkIn"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Check-Out"
                  sortKey="checkOut"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Status"
                  sortKey="status"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <th className="py-3 px-6 bg-indigo-600 text-center text-xs font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentBookings.map((booking) => (
                <tr key={booking._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm text-gray-700 break-words">{booking._id}</td>
                  <td className="py-4 px-6 text-sm text-gray-700">{booking.roomName}</td>
                  <td className="py-4 px-6 text-sm text-gray-700">
                    {new Date(booking.checkIn).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700">
                    {new Date(booking.checkOut).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      } capitalize`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-center">
                    <button
                      onClick={() => openModal(booking)}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center justify-center"
                      title="View Details"
                    >
                      <FaEye className="mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredBookings.length > bookingsPerPage && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex -space-x-px">
            <button
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 ml-0 leading-tight ${
                currentPage === 1
                  ? "text-gray-400 bg-white border border-gray-300 cursor-not-allowed"
                  : "text-indigo-600 bg-white border border-gray-300 hover:bg-indigo-100"
              } rounded-l-md`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-2 leading-tight ${
                  currentPage === number
                    ? "text-white bg-indigo-600"
                    : "text-indigo-600 bg-white hover:bg-indigo-100"
                } border border-gray-300`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 leading-tight ${
                currentPage === totalPages
                  ? "text-gray-400 bg-white border border-gray-300 cursor-not-allowed"
                  : "text-indigo-600 bg-white border border-gray-300 hover:bg-indigo-100"
              } rounded-r-md`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Modal for Booking Details */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {selectedBooking && (
          <div className="p-4">
            <h3 className="text-2xl font-semibold mb-4 text-indigo-700">Booking Details</h3>
            <div className="space-y-3">
              <DetailRow label="Booking ID" value={selectedBooking._id} />
              <DetailRow label="Room Name" value={selectedBooking.roomName} />
              <DetailRow
                label="Check-In"
                value={new Date(selectedBooking.checkIn).toLocaleDateString()}
              />
              <DetailRow
                label="Check-Out"
                value={new Date(selectedBooking.checkOut).toLocaleDateString()}
              />
              <DetailRow
                label="Status"
                value={
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedBooking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : selectedBooking.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    } capitalize`}
                  >
                    {selectedBooking.status}
                  </span>
                }
              />
              {/* Add more details as needed */}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop />
    </div>
  );
};

export default BookingHistory;
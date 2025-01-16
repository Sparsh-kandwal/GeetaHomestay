import React, { useEffect } from "react";

export default function Modal({ title, content, handleCloseModal, isOpen }) {
  // Don't render the modal if isOpen is false
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4 text-indigo-600">{title}</h3>
        <div className="mb-4 text-black">{content}</div>
        <button
          onClick={handleCloseModal}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}

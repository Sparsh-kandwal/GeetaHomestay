import { useEffect } from "react";

export default function Modal({ title, content, handleCloseModal, isOpen }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[24px] bg-white p-5 shadow-2xl sm:p-8">
        <h3 className="mb-4 text-2xl font-bold text-indigo-600">{title}</h3>
        <div className="mb-4 text-black">{content}</div>
        <button
          onClick={handleCloseModal}
          className="rounded bg-blue-600 px-4 py-2 text-white transition duration-300 hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

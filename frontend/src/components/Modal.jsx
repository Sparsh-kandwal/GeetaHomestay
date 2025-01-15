// frontend/src/components/Modal.jsx

import React, { Fragment } from "react";
import { Transition } from "@headlessui/react";

const Modal = ({ isOpen, onClose, children }) => {
    return (
        <Transition show={isOpen} as={Fragment}>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300" // Smoother ease-out transition
                    enterFrom="opacity-0 translate-y-4 scale-95" // Start slightly lower and smaller
                    enterTo="opacity-100 translate-y-0 scale-100" // Move to original position and size
                    leave="ease-in duration-200" // Smoother ease-in transition
                    leaveFrom="opacity-10 translate-y-0 scale-100" // Original position and size
                    leaveTo="opacity-0 translate-y-4 scale-95" // Move slightly lower and smaller
                >
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                            aria-label="Close modal"
                        >
                            &#10005;
                        </button>
                        {children}
                    </div>
                </Transition.Child>
            </div>
        </Transition>
    );
};

export default Modal;
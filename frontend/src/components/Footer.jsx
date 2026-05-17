import { useState } from "react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import Modal from "./Modal";

const Footer = () => {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  return (
    <footer className="bg-[#1f5b52] py-10 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="mb-4 text-xl font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:text-gray-300">
                  Home
                </a>
              </li>
              <li>
                <a href="./rooms" className="hover:text-gray-300">
                  Explore Rooms
                </a>
              </li>
              <li>
                <button
                  onClick={() => setIsTermsModalOpen(true)}
                  className="text-left hover:underline focus:outline-none"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="text-left hover:underline focus:outline-none"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-sm leading-6">
                <strong>Email:</strong>{" "}
                <a href="mailto:geetahomestaykaranprayag@gmail.com" className="break-all hover:underline">
                  geetahomestaykpg@gmail.com
                </a>
              </li>
              <li className="text-sm leading-6">
                <strong>Phone:</strong>{" "}
                <a href="tel:+919756198989" className="hover:underline">
                  +91 9756198989
                </a>
              </li>
              <li className="text-sm leading-6">
                <strong>Address:</strong> Geeta HomeStay, near Petrol Pump, Main Market, Karanprayag,
                Chamoli, Uttarakhand (246444)
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xl font-semibold">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300"
              >
                <FaFacebookF size={24} />
              </a>
              <a
                href="https://www.instagram.com/geetahomestay/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300"
              >
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-4 text-center text-sm">
          <p>© 2025 Geeta HomeStay. All rights reserved.</p>
        </div>
      </div>

      <Modal
        title="Terms and Conditions"
        isOpen={isTermsModalOpen}
        handleCloseModal={() => setIsTermsModalOpen(false)}
        content={
          <ul className="list-disc space-y-2 pl-5">
            <li>Early check-in or late check-out is subject to availability and may be chargeable by the hotel directly.</li>
            <li>Check-in time is 12:00 PM, Check-out time is 10:30 AM.</li>
            <li>No cancellations or refunds.</li>
            <li>It is mandatory for guests to present valid photo identification upon check-in.</li>
            <li>The credit card holder must be one of the travelers.</li>
            <li>
              We reserve the right to cancel or modify reservations where it appears that a customer
              has engaged in fraudulent or inappropriate activity or where the reservation resulted from
              a mistake or error.
            </li>
          </ul>
        }
      />

      <Modal
        title="Privacy Policy"
        isOpen={isPrivacyModalOpen}
        handleCloseModal={() => setIsPrivacyModalOpen(false)}
        content={
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Information We Collect:</strong> We collect personal information such as your name, email address, phone number, and payment details during the booking process.</li>
            <li><strong>How We Use Your Information:</strong> Your information is used to process bookings, provide customer support, personalize your experience, and comply with legal obligations.</li>
            <li><strong>Data Security:</strong> We implement industry-standard security measures to protect your personal information.</li>
            <li><strong>Data Sharing:</strong> We do not share your personal information with third parties or advertisers except where required for your booking or by law.</li>
            <li><strong>Use of Cookies:</strong> We use cookies to enhance your browsing experience and understand website activity.</li>
            <li><strong>Your Rights:</strong> You have the right to access, correct, or delete your data and may withdraw your consent where applicable.</li>
            <li><strong>Children's Privacy:</strong> Our website is not intended for individuals under 18 years of age.</li>
            <li><strong>Policy Updates:</strong> This Privacy Policy may be updated periodically.</li>
            <li><strong>Contact Us:</strong> Reach us at <em>geetahomestaykaranprayag@gmail.com</em> or <em>+91 9756198989</em>.</li>
          </ul>
        }
      />
    </footer>
  );
};

export default Footer;

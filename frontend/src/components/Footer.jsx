import React, { useState } from "react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import Modal from "./Modal"; // Import the reusable Modal component

const Footer = () => {
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const handleOpenTermsModal = () => setIsTermsModalOpen(true);
  const handleCloseTermsModal = () => setIsTermsModalOpen(false);

  const handleOpenPrivacyModal = () => setIsPrivacyModalOpen(true);
  const handleClosePrivacyModal = () => setIsPrivacyModalOpen(false);

  return (
    <div className="bg-[#3a328c] text-white py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Footer Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Quick Links Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
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
              {/* Modal Buttons */}
              <li>
                <button
                  onClick={handleOpenTermsModal}
                  className="hover:underline focus:outline-none"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={handleOpenPrivacyModal}
                  className="hover:underline focus:outline-none"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-sm">
                <strong>Email:</strong>
                <a
                  href="mailto:geetahomestaykaranprayag@gmail.com"
                  className="hover:underline"
                >
                  {" "}
                  geetahomestaykaranprayag@gmail.com
                </a>
              </li>
              <li className="text-sm">
                <strong>Phone: </strong>
                <a href="tel:+919756198989" className="hover:underline">
                  +91 9756198989
                </a>
              </li>
              <li className="text-sm">
                <strong>Address:</strong> Geeta HomeStay, near Petrol Pump, Main
                Market, Karanprayag, Chamoli, Uttarakhand (246444)
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="text-xl font-semibold mb-4">
            <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300"
              >
                <FaFacebookF size={24} /> {/* React Icon for Facebook */}
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300"
              >
                <FaInstagram size={24} /> {/* React Icon for Instagram */}
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="text-center mt-10 border-t pt-4 text-sm">
          <p>© 2025 Geeta HomeStay. All rights reserved.</p>
        </div>
      </div>

      {/* Modal for Terms and Conditions */}
      <Modal
        title="Terms and Conditions"
        content={
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Early check-in or late check-out is subject to availability and
              may be chargeable by the hotel directly.
            </li>
            <li>Check-in time is 12:00 PM, Check-out time is 10:30 AM.</li>
            <li>
              If cancelled before 7 days: 85% refund, Between 7 days-72 hrs: 50%
              refund, Less than 72hrs, No-Shows or Early Checkout: No refund.
            </li>
            <li>
              It is mandatory for guests to present valid photo identification
              upon check-in.
            </li>
            <li>The Credit Card Holder must be one of the travelers.</li>
            <li>
              We reserve the right to cancel or modify reservations where it
              appears that a customer has engaged in fraudulent or inappropriate
              activity or under other circumstances where it appears that the
              reservations contain or resulted from a mistake or error.
            </li>
          </ul>
        }
        isOpen={isTermsModalOpen} // Pass isOpen prop to control visibility
        handleCloseModal={handleCloseTermsModal} // Pass handleCloseModal to close the modal
      />

      {/* Modal for Privacy Policy */}
      <Modal
        title="Privacy Policy"
        content={
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Information We Collect:</strong> We collect personal
              information such as your name, email address, phone number, and
              payment details during the booking process. We also collect login
              credentials and usage data to improve your experience.
            </li>
            <li>
              <strong>How We Use Your Information:</strong> Your information is
              used to process bookings, provide customer support, personalize
              your experience, and comply with legal obligations.
            </li>
            <li>
              <strong>Data Security:</strong> We implement industry-standard
              security measures to protect your personal information. Booking
              data is shared only with the hotel authority. Payment details are
              processed through encrypted channels using certified gateways.
            </li>
            <li>
              <strong>Data Sharing:</strong> We do not share your personal
              information with third parties or advertisers. Your data is shared
              only with the hotel you book with or when required by law.
            </li>
            <li>
              <strong>Use of Cookies:</strong> We use cookies to enhance your
              browsing experience by understanding your preferences and tracking
              website activity. You can disable cookies in your browser settings
              if desired.
            </li>
            <li>
              <strong>Your Rights:</strong> You have the right to access,
              correct, or delete your data. You may also withdraw your consent
              for data processing at any time.
            </li>
            <li>
              <strong>Children’s Privacy:</strong> Our website is not intended
              for individuals under 18 years of age. We do not knowingly collect
              data from children.
            </li>
            <li>
              <strong>Policy Updates:</strong> This Privacy Policy may be
              updated periodically. Please review it regularly to stay informed.
            </li>
            <li>
              <strong>Contact Us:</strong> If you have questions or concerns,
              you can contact us at <em>geetahomestaykaranprayag@gmail.com</em> or
              <em>+91 9756198989 </em>.
            </li>
          </ul>
        }
        isOpen={isPrivacyModalOpen} // Pass isOpen prop to control visibility
        handleCloseModal={handleClosePrivacyModal} // Pass handleCloseModal to close the modal
      />
    </div>
  );
};

export default Footer;

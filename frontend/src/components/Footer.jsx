import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <div className="bg-[#3a328c] text-white py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Footer Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Quick Links Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-gray-300">Home</a></li>
              <li><a href="/explore" className="hover:text-gray-300">Explore Rooms</a></li>
              <li><a href="/about" className="hover:text-gray-300">Gallery</a></li>
              <li><a href="/contact" className="hover:text-gray-300">Profile</a></li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-sm">Email: support@example.com</li>
              <li className="text-sm">Phone: +123 456 7890</li>
              <li className="text-sm">Address: 123 Main Street, City, Country</li>
            </ul>
          </div>
          
          {/* Social Media Section */}
          <div className="flex flex-col items-center">
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
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300"
              >
                <FaTwitter size={24} /> {/* React Icon for Twitter */}
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300"
              >
                <FaInstagram size={24} /> {/* React Icon for Instagram */}
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300"
              >
                <FaLinkedinIn size={24} /> {/* React Icon for LinkedIn */}
              </a>
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="text-center mt-10 border-t pt-4 text-sm">
          <p>© 2024 Your Company Name. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;

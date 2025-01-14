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
              <li><a href="./rooms" className="hover:text-gray-300">Explore Rooms</a></li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
            <li className="text-sm"><strong>Email:</strong><a href="mailto:geetahomestaykaranprayag@gmail.com" > geetahomestaykaranprayag@gmail.com</a></li>
            <li className="text-sm"><strong>Phone: </strong><a href="tel:+919756198989" className=" hover:underline">+91 9756198989</a></li>
            <li className="text-sm"><strong>Address:</strong> Geeta HomeStay, near Petrol Pump, Main Market, Karanprayag, Chamoli, Uttarakhand (246444)</li>
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
    </div>
  );
};

export default Footer;
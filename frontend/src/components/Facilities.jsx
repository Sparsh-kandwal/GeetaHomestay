import React from 'react'
import { Wifi, Car, Droplet, UtensilsCrossed, Clock } from 'lucide-react';

const Facilities = () => {
  const facilities = [
    { name: "Free Parking", icon: Car },
    { name: "Free WiFi", icon: Wifi },
    { name: "24 Hours Hot Water", icon: Droplet },
    { name: "Food Facility Available", icon: UtensilsCrossed },
    { name: "24/7 Service", icon: Clock },
  ];
  return (
    <div>
      <section  className="bg-gray-100 py-16 scroll-mt-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Facilities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {facilities.map((facility, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 text-center">
              <facility.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <p className="font-semibold">{facility.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
    </div>
  )
}

export default Facilities
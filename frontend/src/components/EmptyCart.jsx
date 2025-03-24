"use client"
import { motion } from "framer-motion"
import { ShoppingCart, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

const EmptyCart = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart size={40} className="text-blue-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h1>

        <p className="text-gray-600 mb-8">
          Looks like you haven't added any rooms to your cart yet. Explore our selection of rooms and find the perfect
          stay for your next trip.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Browse Rooms
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </div>
  )
}

export default EmptyCart;


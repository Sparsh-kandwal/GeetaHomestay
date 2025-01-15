import Testimonial from "../models/Testimonials.js";

// Controller to retrieve all testimonials
export const getAllTestimonials = async (req, res) => {
  try {
    // Retrieve all testimonials from the database
    const testimonials = await Testimonial.find();

    // Return the testimonials in the response
    res.status(200).json(testimonials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while retrieving testimonials' });
  }
};


import mongoose from "mongoose";


const testimonialSchema = new mongoose.Schema({
  username: { type: String, required: true },
  testimonial: { type: String, required: true },
  rating: { type: String, required: true },
  image: { type: String, required: true }
});

// Create the Testimonial model
const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial

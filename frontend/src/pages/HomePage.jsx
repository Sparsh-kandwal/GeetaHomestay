import React from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import Footer from '../components/Footer'

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <div className='flex-grow'>
        <HeroSection />
      </div>
      <Footer />

    </div>
  )
}

export default HomePage
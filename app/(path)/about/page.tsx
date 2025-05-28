import FutureGoals from '@/components/(about)/FutureGoals'
import MissionVision from '@/components/(about)/MissionVision'
import OurStory from '@/components/(about)/OurStory'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import React from 'react'

const AboutPage = () => {
return (
    <div>
    <Navbar/>
    <OurStory/>
    <MissionVision/>
    <FutureGoals/>
    <Footer/>
    </div>
)
}

export default AboutPage

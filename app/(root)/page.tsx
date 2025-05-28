import VideoBackground from "../components/VideoBackground"
import Show from "@/components/(homepage)/Show"
import HowItWorks from "@/components/(homepage)/HowItWorks"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
const page = () => {
  return (
    <div>
      <Navbar/>
      <VideoBackground />
      <Show/>
      <HowItWorks/>
      <Footer/>
    </div>
  )
}

export default page

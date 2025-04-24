import Navbar from "@/components/Navbar"
import VideoBackground from "../components/VideoBackground"
import Show from "@/components/(homepage)/Show"
import HowItWorks from "@/components/(homepage)/HowItWorks"
const page = () => {
  return (
    <div>
      <Navbar/>
      <VideoBackground />
      <Show/>
      <HowItWorks/>
    </div>
  )
}

export default page

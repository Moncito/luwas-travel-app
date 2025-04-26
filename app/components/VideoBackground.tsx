const VideoBackground = () => (
        <div className="relative w-full h-screen">
        <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
        >
            <source src="/pattern3.mp4" type="video/mp4" />
            Your browser does not support the video tag.
            
        </video>
        
    
        {/* Text Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center px-4">
        <h1 className="text-4xl md:text-6xl font-great-vibes font-semibold drop-shadow-xl tracking-wide">YOUR PATH TO ADVENTURE</h1>
            <p className="mt-4 text-lg md:text-xl drop-shadow-md text-white">
            Discover your journey with us today....
            </p>
        </div>
        </div>
    );

export default VideoBackground;

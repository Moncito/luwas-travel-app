import { Facebook, Instagram, Mail, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white text-black px-6 py-10 mt-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Branding */}
        <div>
          <h3 className="text-2xl font-bold">Luwas</h3>
          <p className="text-sm text-gray-600 mt-2 max-w-xs">
          Luwas is your trusted travel companion, thoughtfully designed to help you uncover the hidden wonders of the Philippines. We make every journey smarter, easier, and more meaningful—from the first click to your final destination.
          </p>
        </div>

        {/* Quick Links */}
        <div className="text-center">
            <h4 className="font-semibold text-lg mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-black/80 list-none">
            <li><a href="#" className="hover:underline">Explore</a></li>
            <li><a href="#" className="hover:underline">Plan</a></li>
            <li><a href="#" className="hover:underline">Travel Tips</a></li>
            <li><a href="#" className="hover:underline">Contact Us</a></li>
        </ul>
        </div>

        {/* Newsletter & Socials */}
        <div>
          <h4 className="font-semibold text-lg mb-3">Stay in the loop</h4>
          <form className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="rounded-full px-4 py-2 text-sm text-black border border-gray-300 w-full sm:w-auto"
            />
            <button className="bg-black text-white px-4 py-2 rounded-full font-semibold hover:bg-gray-800 transition">
              Subscribe
            </button>
          </form>

          <div className="flex space-x-19 text-gray-600 pt-8">
            <a href="#"><Instagram className="w-5 h-5 hover:text-black" /></a>
            <a href="https://www.facebook.com/mdcctravelandtours"><Facebook className="w-5 h-5 hover:text-black" /></a>
            <a href="mailto:support@luwas.app"><Mail className="w-5 h-5 hover:text-black" /></a>
            <a href="https://github.com/your-repo" target="_blank"><Github className="w-5 h-5 hover:text-black" /></a>
          </div>
        </div>
      </div>

      {/* Legal Bottom */}
      <div className="mt-12 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Luwas. All rights reserved. | Terms & Privacy
      </div>
    </footer>
  );
}

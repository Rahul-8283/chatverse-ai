import React from 'react';
import logo from '../assets/logo.png';
import { RiMoonLine, RiSunLine, RiShutDownLine, RiSettings2Line } from "react-icons/ri";
import { FiFileText, FiMessageCircle } from "react-icons/fi";
import { auth } from '../firebase/firebase';
import { signOut } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext';
import SettingsModal from './SettingsModal';

const Navlinks = ({ isRagMode, setIsRagMode }) => {
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } 
    catch(error){
      console.log(error);
    }
  }

  return (
    <section className="sticky lg:static top-0 flex items-center lg:items-start lg:justify-start h-[7vh] lg:h-[100vh] w-[100%] lg:w-[132px] py-8 lg:py-0 bg-primary text-primary-foreground transition-colors duration-300 z-50">
      <main className="flex lg:flex-col items-center lg:gap-10 justify-between lg:px-0 w-[100%]">
        <div className="flex items-start justify-center lg:border-b border-b-1 border-white/30 lg:w-[100%] p-4">
          <span className="flex items-center justify-center">
            <img src={logo} className="w-14 h-12 object-contain bg-white rounded-lg p-2" alt="ChatVerse Logo" />
          </span>
        </div>

        {/* Centered Icons */}
        <ul className="flex lg:flex-col flex-row items-center justify-center flex-grow lg:gap-10 gap-7 px-2 md:px-0">
          {/* Document/Chat Toggle */}
          <li>
            <button 
              onClick={() => setIsRagMode(!isRagMode)}
              className="lg:text-[28px] text-[22px] cursor-pointer hover:text-white/80 transition-colors"
              title={isRagMode ? "Switch to Chat" : "Switch to Document Analysis"}
            >
              {isRagMode ? <FiMessageCircle color="#fff" /> : <FiFileText color="#fff" />}
            </button>
          </li>
        </ul>

        {/* Bottom Icons */}
        <ul className="flex lg:flex-col flex-row items-center lg:gap-8 gap-7 px-4 lg:pb-8">
          <li>
            <button onClick={toggleTheme} className="lg:text-[28px] text-[22px] cursor-pointer hover:text-white/80 transition-colors">
              {theme === 'dark' ? <RiSunLine color="#fff" /> : <RiMoonLine color="#fff" />}
            </button>
          </li>
          <li>
            <SettingsModal />
          </li>
          <li>
            <button onClick={handleLogout} className="lg:text-[28px] text-[22px] cursor-pointer hover:text-red-400 transition-colors">
              <RiShutDownLine color="#fff" />
            </button>
          </li>
        </ul>
      </main>
    </section>
  )
}

export default Navlinks;

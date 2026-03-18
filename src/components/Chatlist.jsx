import React, { useState, useEffect, useMemo } from 'react';
import { RiMore2Fill } from 'react-icons/ri';
import SearchModal from './SearchModal';
import chatData from '../data/chats';
import formatTimestamp from '../utils/formatTimestamp.js';
import { auth, db, listenForChats } from '../firebase/firebase.js';
import { onSnapshot, doc } from 'firebase/firestore';

import botAvatar from "../assets/bot-avatar.png";
import default1 from "../assets/default1.jpg";

const Chatlist = ({ setSelectedUser }) => {
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);
  const [aiBot, setAiBot] = useState(null);

  useEffect(() => {
    const userDocRef = doc(db, "users", auth?.currentUser?.uid);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      setUser(doc.data());
    });

    return () => unsubscribe();
  }, []);

  // Fetch AI Bot user
  useEffect(() => {
    const fetchAIBot = async () => {
      try {
        const aiBotRef = doc(db, "users", "ai-assistant-bot");
        const unsubscribe = onSnapshot(aiBotRef, (doc) => {
          if (doc.exists()) {
            setAiBot(doc.data());
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching AI Bot:", error);
      }
    };

    fetchAIBot();
  }, []);

  useEffect(() => {
    const unsubscribe = listenForChats(setChats);
    return () => {
      unsubscribe();
    }
  }, []);

  const sortedChats = useMemo(() => {
    // in order to remember the old data
    return [...chats].sort((a, b) => {
      const aTimestamp = a?.lastMessageTimestamp?.seconds + a?.lastMessageTimestamp?.nanoseconds / 1e9;
      const bTimestamp = b?.lastMessageTimestamp?.seconds + b?.lastMessageTimestamp?.nanoseconds / 1e9;

      return bTimestamp - aTimestamp;
    });
  }, [chats]);

  const startChat = (user) => {
    setSelectedUser(user);
  }

  return (
    <section className="relative hidden lg:flex flex-col item-start justify-start bg-white h-[100vh] w-[100%] md:w-[580px] ">
      <header className="flex items-center justify-between w-[100%] lg:border-b border-b-1 border-[#898989b9] p-4 sticky md:static top-0 z-[100] border-r border-[#9090902c]">
        <main className="flex items-center gap-3">
          <img src={user?.image || default1} className="w-[44px] h-[44px] object-cover rounded-full" alt="temp" />
          <span>
            <h3 className="p-0 font-semibold text-[#2A3D39] md:text-[17px]">{user?.fullName || "ChatVerse User"}</h3>
            <p className="p-0 font-light text-[#2A3D39] text-[15px]">@{user?.username || "chatverse"}</p>
          </span>
        </main>
        <button className="bg-[#D9F2ED] w-[35px] h-[35px] p-2 flex items-center justify-center rounded-lg">
          <RiMore2Fill color="#01AA85" className="w-[28px] h-[28px] cursor-pointer" />
        </button>
      </header>

      <div className='w-[100%] mt-[10px] px-5 '>
        <header className='flex items-center justify-between  '>
          <h3 className='text-[16px]'>Message ({chats?.length || 0})</h3>
          <SearchModal startChat={startChat} />
        </header>
      </div>

      <main className='flex flex-col items-start mt-[1.5rem] pb-3'>
        {/* AI Bot - Display like normal chats */}
        {aiBot && (
          <button
            onClick={() => setSelectedUser(aiBot)}
            className="flex items-start justify-between w-[100%] border-b border-[#9090902c] px-5 py-3 hover:bg-[#f9f9f9] transition"
          >
            <div className="flex items-start gap-3">
              <img src={botAvatar} className="h-[40px] w-[40px] rounded-full object-cover" alt="ChatVerse AI" />
              <span>
                <h2 className="p-0 font-semibold text-[#2A3d39] text-left text-[17px]">
                  ChatVerse AI
                </h2>
                <p className="p-0 font-light text-[#2A3d39] text-left text-[14px]">
                  @{aiBot?.username || "chatverse-ai"}
                </p>
              </span>
            </div>
          </button>
        )}

        {/* Regular User Chats */}
        {sortedChats?.map((chat) => (
          <button key={chat?.id} className="flex items-start justify-between w-[100%] border-b border-[#9090902c] px-5 py-3 hover:bg-[#f9f9f9] transition">
            {chat?.users
              ?.filter((user) => user?.email !== auth?.currentUser?.email)
              ?.map((user) => (
                <>
                  <div className="flex items-start gap-3" onClick={() => setSelectedUser(user)} >
                    <img src={user?.image || default1} className="h-[40px] w-[40px] rounded-full object-cover" alt="" />
                    <span>
                      <h2 className="p-0 font-semibold text-[#2A3d39] text-left text-[17px]">{user?.fullName || "ChatFrik User"}</h2>
                      <p className="p-0 font-light text-[#2A3d39] text-left text-[14px]">{chat?.lastMessage}</p>
                    </span>
                  </div>
                  <p className="p-0 font-regular text-gray-400 text-left text-[11px]">{formatTimestamp(chat?.lastMessageTimestamp)}</p>
                </>
              ))}
          </button>
        ))}
      </main>
    </section>
  )
}

export default Chatlist;
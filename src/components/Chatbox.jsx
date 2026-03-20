import React, { useState, useEffect, useMemo, useRef } from 'react';
import default1 from "../assets/default1.jpg";
import formatTimestamp from '../utils/formatTimestamp.js';
import { RiSendPlaneFill } from "react-icons/ri";
import { messageData } from "../data/messageData.js";
import { sendMessage } from '../firebase/firebase.js';
import { auth } from '../firebase/firebase.js';
import logo from "../assets/logo.png";
import { listenForMessages } from '../firebase/firebase.js';

const Chatbox = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, sendMessageText] = useState("");
  const scrollRef = useRef(null);

  const chatId = auth?.currentUser?.uid < selectedUser?.uid ? `${auth?.currentUser?.uid}-${selectedUser?.uid}` : `${selectedUser?.uid}-${auth?.currentUser?.uid}`;
  const user1 = auth?.currentUser;
  const user2 = selectedUser;
  const senderEmail = auth?.currentUser?.email;

  useEffect(() => {
    listenForMessages(chatId, setMessages);
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const aTimestamp = a?.timestamp?.seconds + a?.timestamp?.nanoseconds / 1e9;
      const bTimestamp = b?.timestamp?.seconds + b?.timestamp?.nanoseconds / 1e9;

      return aTimestamp - bTimestamp;
    });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    const newMessage = {
      sender: senderEmail,
      text: messageText,
      timestamp: {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
      },
    }

    sendMessage(messageText, chatId, user1?.uid, user2?.uid);
    setMessages((prevMessage) => [...prevMessage, newMessage]);
    sendMessageText("");
  };

  return (
    <>
      {selectedUser ? (
        <section className='flex flex-col items-start justify-start h-screen w-[100%] background-image'>
          <header className='border-b border-border w-[100%] h-[70px] md:h-fit p-4 bg-card '>
            <main className='flex items-center gap-3 '>
              <span>
                <img src={selectedUser?.image || default1} className="w-11 h-11 object-cover rounded-full " alt="Chat name" />
              </span>
              <span>
                <h3 className="font-semibold text-foreground text-lg">{selectedUser?.fullName || "ChatVerse User"}</h3>
                <p className="font-light text-muted-foreground text-sm">@{selectedUser?.username || "chatverse"}</p>
              </span>
            </main>
          </header>

          <main className="relative h-[100vh] w-[100%] flex flex-col justify-between ">
            <section className="px-3 pt-5 b-20 lg:pb-10 ">
              <div ref={scrollRef} className="overflow-auto h-[80vh]">

                {sortedMessages?.map((msg, index) => (
                  <>
                    {msg?.sender == senderEmail ? (
                      <div className="flex flex-col items-end w-full">
                        <span className="flex gap-3 h-auto ms-10 lg:me-7 me-2.5 mb-5">
                          <div>
                            <div className="flex items-center bg-card text-card-foreground justify-center p-4 rounded-lg shadow-sm">
                              <h4>{msg?.text}</h4>
                            </div>
                            <p className="text-muted-foreground text-sx mt-1.5 text-right">{formatTimestamp(msg?.timestamp)}</p>
                          </div>
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start w-full ">
                        <span className="flex gap-3 w-[40%] h-auto lg:ms-6 ms-2 mb-5">
                          <img src={default1} className="h-11 w-11 object-cover rounded-full " alt="" />
                          <div>
                            <div className="flex items-center bg-card text-card-foreground justify-center p-4 rounded-lg shadow-sm">
                              <h4>{msg?.text}</h4>
                            </div>
                            <p className="text-muted-foreground text-sx mt-1.5 text-right">{formatTimestamp(msg?.timestamp)}</p>
                          </div>
                        </span>
                      </div>
                    )}
                  </>
                ))}

              </div>
            </section>

            <div className="sticky lg:bottom-0 bottom-[60px] p-3 h-fit w-[100%] ">
              <form onSubmit={handleSendMessage} className="flex items-center bg-card h-[45px] w-[100%] px-2 rounded-lg relative shadow-lg ">
                <input value={messageText} onChange={(e) => sendMessageText(e.target.value)} type="text" className="h-full text-foreground outline-none text-[16px] pl-3 pr-[40px] rounded-lg w-[100%] bg-transparent" name="" id="" placeholder="Write your message..." />
                <button type="submit" action="submit" className="flex items-center justify-center absolute right-3 p-2 rounded-md bg-muted hover:brightness-95 text-primary ">
                  <RiSendPlaneFill className="text-primary" />
                </button>
              </form>
            </div>
          </main>
        </section>
      ) : (
        <section className='h-[100vh] w-[100%] bg-background text-foreground '>
          <div className='flex flex-col justify-center items-center h-[100vh] '>
            <img src={logo} alt="" width={100} />
            <h1 className="text-[30px] font-bold text-primary mt-5">Welcome to ChatVerse</h1>
            <p className="text-muted-foreground">Connect and chat with friends easily, securely, fast and free</p>
          </div>
        </section>
      )}
    </>
  )
}

export default Chatbox;
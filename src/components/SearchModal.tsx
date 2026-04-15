import React, { useState, useEffect, useMemo } from 'react';
import { RiSearchLine } from 'react-icons/ri';
import { FaXmark } from 'react-icons/fa6';
import { FaSearch } from 'react-icons/fa';
import default1 from "../assets/default1.jpg";
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { toast } from 'react-toastify';

const SearchModal = ({ startChat }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  const openModel = () => {
    setIsModalOpen(true);
    toast.info("Type a username to search for users to chat with!");
  };
  const closeModel = () => setIsModalOpen(false);

  // Fetch all users once
  useEffect(() => {
    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const usersList = snapshot.docs
        .map((doc) => doc.data())
        .filter((user) => user.uid !== auth.currentUser.uid && !user.isBot); // Exclude self and bots
      setAllUsers(usersList);
    });

    return () => unsubscribe();
  }, []);

  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) {
      return allUsers; // Show all users if search is empty
    }
    return allUsers.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allUsers]);

  return (
    <div>
      <button onClick={openModel} className="bg-muted w-[35px] h-[35px] p-2 flex items-center justify-center rounded-lg ">
        <RiSearchLine className="w-[18px] h-[18px] cursor-pointer text-primary" />
      </button>

      {isModalOpen && (
        <div onClick={closeModel} className="fixed inset-0 z-[100] flex justify-center items-center bg-black/60 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-card text-card-foreground w-[100%] rounded-lg shadow-xl border border-border">
              <div className="flex items-center justify-between p-4 md:p-5 border-b border-border">
                <h3 className="text-xl font-semibold">Search Chat</h3>
                <button onClick={closeModel} className="text-muted-foreground bg-transparent hover:bg-muted rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                  <FaXmark size={20} />
                </button>
              </div>
              <div className="p-4 md:p-5">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      type="text"
                      className="bg-background border border-border text-foreground text-sm rounded-lg outline-none w-full p-2.5 focus:ring-2 focus:ring-primary"
                      placeholder="Search users by username..."
                    />
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:brightness-90 transition-all">
                      <FaSearch />
                    </button>
                  </div>
                </div>
                <div className="mt-6 h-[40vh] overflow-y-auto pr-2">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user.uid}
                        onClick={() => {
                          startChat(user);
                          closeModel();
                        }}
                        className="flex items-center gap-3 hover:bg-muted p-2.5 mb-3 rounded-lg cursor-pointer border border-transparent hover:border-border transition-colors"
                      >
                        <img src={user?.image || default1} className="h-11 w-11 object-cover rounded-full" alt={user.username} />
                        <span>
                          <h2 className="p-0 font-semibold text-foreground text-lg">{user?.fullName}</h2>
                          <p className="text-sm text-muted-foreground">@{user?.username}</p>
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground mt-10">
                      <p>{searchTerm ? "No users found." : "No other users available."}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchModal;

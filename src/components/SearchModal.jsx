import React, { useState } from 'react'
import { RiSearchLine } from 'react-icons/ri';
import { FaXmark } from 'react-icons/fa6';
import { FaSearch } from 'react-icons/fa';
import default1 from "../assets/default1.jpg"
import { collection, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const SearchModal = ({ startChat }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);

  const openModel = () => setIsModalOpen(true);
  const closeModel = () => setIsModalOpen(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      window.alert("Please enter a name to search !!");
      return;
    }
    try {
      const normalizedSearchTerm = searchTerm.toLowerCase();
      const q = query(
        collection(db, "users"),
        where("username", ">=", normalizedSearchTerm),
        where("username", "<=", normalizedSearchTerm + "\uf8ff")
      );

      const querySnapshot = await getDocs(q);
      const foundUsers = [];

      querySnapshot.forEach((doc) => {
        foundUsers.push(doc.data());
      });
      setUsers(foundUsers);

      if (foundUsers.length === 0) {
        alert("No user found !!");
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <button onClick={openModel} className="bg-primary/20 w-[35px] h-[35px] p-2 flex items-center justify-center rounded-lg ">
        <RiSearchLine color="#8db87a" className="w-[18px] h-[18px] cursor-pointer " />
      </button>

      {isModalOpen && (
        <div onClick={closeModel} className="fixed inset-0 z-100 flex justify-center items-center bg-[#00170cb7]">
          <div onClick={(e) => e.stopPropagation()} className="relative p-4 w-full max-w-md  max-h-full" >
            <div className="relative bg-[#8db87a] w-[100%] rounded-md shadow-lg">
              <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-300 border-opacity-30">
                <h3 className="text-xl font-semibold text-[#0a0f0e]">Search Chat</h3>
                <button onClick={closeModel} className="text-[#0a0f0e] bg-transparent hover:bg-[#0a0f0e]/10 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                  <FaXmark size={20} />
                </button>
              </div>
              <div className="p-4 md:p-5">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input onChange={(e) => setSearchTerm(e.target.value)} type="text" className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg outline-none w-full p-2.5" placeholder="Search users" />
                    <button onClick={handleSearch} className="bg-[#121a17] text-[#8db87a] px-3 py-2 rounded-lg">
                      <FaSearch />
                    </button>
                  </div>
                </div>
                <div className="mt-6">
                  {users?.map((user) => (
                    <div onClick={() => {
                      console.log(user);
                      startChat(user);
                      closeModel();
                    }}
                      className="flex items-start gap-3 bg-[#0a0f0e]/20 p-2 mb-3 rounded-lg cursor-pointer border border-[#ffffff20] shadow-sm ">
                      <img src={user?.image || default1} className="h-[40px] w-[40px] rounded-full" alt="" />
                      <span>
                        <h2 className="p-0 font-semibold text-[#0a0f0e] text-[18px]">{user?.fullName}</h2>
                        <p className="text-[13px] text-[#0a0f0e]">@{user?.username}</p>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
      }

    </div >
  )
}

export default SearchModal;

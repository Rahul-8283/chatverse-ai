import React, { useState, useEffect, useRef } from 'react';
import { RiSettings2Line, RiCloseLine, RiImageAddLine, RiLockPasswordLine, RiUserUnfollowLine, RiCheckLine, RiLoader4Line, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { auth, db, updateUserProfile } from '../firebase/firebase.ts';
import { onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { uploadImageToCloudinary } from '../utils/cloudinaryHelper.ts';
import default1 from "../assets/default1.jpg";

const SettingsModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // profile, security, danger

  // Form states
  const [fullName, setFullName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Loading states
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const fileInputRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!auth.currentUser) return;
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUser(userData);
        setFullName(userData.fullName);
        setImagePreview(userData.image || default1);
      }
    });
    return () => unsubscribe();
  }, [isModalOpen]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    // Reset states on close
    setActiveTab('profile');
    setImageFile(null);
    if (user) setImagePreview(user.image || default1);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateFullName = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error("Full name must be at least 2 characters.");
      return;
    }
    if (fullName.trim() === user.fullName) {
      toast.info("No changes to save.");
      return;
    }

    setIsUpdatingName(true);
    try {
      await updateUserProfile(auth.currentUser.uid, { fullName: fullName.trim() });
      toast.success("Full name updated successfully!");
    } catch (error) {
      toast.error("Failed to update name. Please try again.");
      console.error(error);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleUpdateProfileImage = async () => {
    if (!imageFile) {
      toast.error("Please select an image first.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const imageURL = await uploadImageToCloudinary(imageFile);
      if (imageURL) {
        await updateUserProfile(auth.currentUser.uid, { image: imageURL });
        toast.success("Profile picture updated!");
        setImageFile(null); // Reset file input
      }
    } catch (error) {
      // Error is already handled in the helper
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error("All password fields are required.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      toast.success("Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect current password.");
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error("Session expired. Please log in again to change your password.");
      } else {
        toast.error("Failed to update password. Please try again.");
      }
      console.error(error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deleteConfirmPassword) {
      toast.error("Please enter your password to confirm deletion.");
      return;
    }

    setIsDeletingAccount(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, deleteConfirmPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Delete user document from Firestore
      await deleteDoc(doc(db, "users", auth.currentUser.uid));
      
      // Delete user from Auth
      await deleteUser(auth.currentUser);
      
      toast.success("Account deleted successfully. You will be logged out.");
      closeModal();
      // The onAuthStateChanged listener in App.jsx will handle the redirect to login
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect password. Deletion failed.");
      } else {
        toast.error("Failed to delete account. Please try again.");
      }
      console.error(error);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const TabButton = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabName
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      }`}
    >
      {label}
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* --- Profile Image Section --- */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className="w-28 h-28 rounded-full object-cover border-4 border-border shadow-lg"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <RiImageAddLine size={32} className="text-white" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              {imageFile && (
                <button
                  onClick={handleUpdateProfileImage}
                  disabled={isUploadingImage}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:brightness-90 transition-all w-full sm:w-auto"
                >
                  {isUploadingImage ? <RiLoader4Line className="animate-spin" /> : <RiCheckLine />}
                  <span>{isUploadingImage ? 'Uploading...' : 'Save Photo'}</span>
                </button>
              )}
            </div>

            {/* --- Full Name Section --- */}
            <form onSubmit={handleUpdateFullName} className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-muted-foreground">Full Name</label>
              <div className="flex gap-2">
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-background border border-border text-foreground text-sm rounded-lg outline-none w-full p-2.5 focus:ring-2 focus:ring-primary"
                  placeholder="Your full name"
                />
                <button
                  type="submit"
                  disabled={isUpdatingName}
                  className="flex items-center justify-center bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:brightness-90 transition-all"
                >
                  {isUpdatingName ? <RiLoader4Line className="animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        );
      case 'security':
        return (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-background border border-border text-foreground text-sm rounded-lg outline-none w-full p-2.5 pr-10 focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground">
                  {showCurrentPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">New Password</label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-background border border-border text-foreground text-sm rounded-lg outline-none w-full p-2.5 pr-10 focus:ring-2 focus:ring-primary"
                  placeholder="New password (min. 6 chars)"
                />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground">
                  {showNewPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="bg-background border border-border text-foreground text-sm rounded-lg outline-none w-full p-2.5 pr-10 focus:ring-2 focus:ring-primary"
                  placeholder="Confirm new password"
                />
                <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground">
                  {showConfirmPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-semibold hover:brightness-90 transition-all"
            >
              {isUpdatingPassword ? <RiLoader4Line className="animate-spin" /> : <RiLockPasswordLine />}
              <span>{isUpdatingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        );
      case 'danger':
        return (
          <div className="space-y-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <h4 className="font-bold text-destructive">Danger Zone</h4>
            <p className="text-sm text-destructive/80">
              Deleting your account is permanent and cannot be undone. All your data, including chats and profile information, will be lost forever.
            </p>
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-destructive/90">Enter your password to confirm:</label>
                <input
                  type="password"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  className="bg-background border border-destructive/50 text-foreground text-sm rounded-lg outline-none w-full p-2.5 focus:ring-2 focus:ring-destructive"
                  placeholder="Enter password to confirm"
                />
              </div>
              <button
                type="submit"
                disabled={isDeletingAccount}
                className="w-full flex items-center justify-center gap-2 bg-destructive text-destructive-foreground px-4 py-2.5 rounded-md text-sm font-semibold hover:brightness-90 transition-all"
              >
                {isDeletingAccount ? <RiLoader4Line className="animate-spin" /> : <RiUserUnfollowLine />}
                <span>{isDeletingAccount ? 'Deleting...' : 'Delete My Account Permanently'}</span>
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <button onClick={openModal} className="lg:text-[28px] text-[22px] cursor-pointer">
        <RiSettings2Line color="#fff" />
      </button>

      {isModalOpen && (
        <div onClick={closeModal} className="fixed inset-0 z-[100] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4">
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md max-h-[90vh] bg-card text-card-foreground rounded-xl shadow-2xl border border-border flex flex-col">
            {/* --- Header --- */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-xl font-bold">Settings</h3>
              <button onClick={closeModal} className="text-muted-foreground bg-transparent hover:bg-muted rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
                <RiCloseLine size={20} />
              </button>
            </div>

            {/* --- Tabs --- */}
            <div className="flex justify-center gap-2 p-4 border-b border-border">
              <TabButton tabName="profile" label="Profile" />
              <TabButton tabName="security" label="Security" />
              <TabButton tabName="danger" label="Danger Zone" />
            </div>

            {/* --- Content --- */}
            <div className="p-6 overflow-y-auto">
              {renderContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsModal;

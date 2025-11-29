"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ProfileSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onProfileUpdate: (type: 'image' | 'password') => void;
}

export default function ProfileSettingsModal({ isOpen, onClose, user, onProfileUpdate }: ProfileSettingsModalProps) {
    const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Password states
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    if (!isOpen) return null;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setMessage(null);

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/user/profile-image", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to upload image");
            }

            // Close modal and trigger update
            onClose();
            onProfileUpdate('image');

            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            setMessage({ type: "error", text: error.message });
        } finally {
            setUploading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Starting password update...");
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters" });
            return;
        }

        try {
            setPasswordLoading(true);

            // Call API to update password server-side
            const response = await fetch("/api/user/update-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update password");
            }

            console.log("Password updated successfully via API. Triggering refresh sequence...");

            // Force reload immediately
            console.log("Calling onProfileUpdate...");
            onProfileUpdate("password");

            console.log("Closing modal...");
            onClose();

            console.log("Pushing to router...");
            router.push("/dashboard?success=password");

            console.log("Refreshing router...");
            router.refresh();

        } catch (error: any) {
            console.error("Password update error:", error);
            setMessage({ type: "error", text: error.message });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Settings</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        className={`flex-1 py-3 font-medium text-sm ${activeTab === "profile"
                            ? "text-[#F44336] border-b-2 border-[#F44336]"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => {
                            setActiveTab("profile");
                            setMessage(null);
                        }}
                    >
                        Profile Image
                    </button>
                    <button
                        className={`flex-1 py-3 font-medium text-sm ${activeTab === "password"
                            ? "text-[#F44336] border-b-2 border-[#F44336]"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => {
                            setActiveTab("password");
                            setMessage(null);
                        }}
                    >
                        Password
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {message && (
                        <div className={`mb-4 p-3 rounded text-sm ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {activeTab === "profile" ? (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center">
                                <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 overflow-hidden relative border-2 border-gray-100">
                                    {user.user_metadata?.avatar_url ? (
                                        <img
                                            src={user.user_metadata.avatar_url}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        // Add a timestamp to bust cache if needed, though the URL usually changes or we rely on browser cache handling
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                                            {user.email?.[0]?.toUpperCase() || "?"}
                                        </div>
                                    )}

                                    {uploading && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                        </div>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="px-4 py-2 bg-[#F44336] text-white rounded hover:bg-[#d32f2f] transition-colors disabled:opacity-50 text-sm font-medium"
                                >
                                    {uploading ? "Uploading..." : "Change Profile Picture"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-[#F44336] focus:border-[#F44336]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-[#F44336] focus:border-[#F44336]"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-[#F44336] focus:border-[#F44336]"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={passwordLoading}
                                className="w-full py-2 bg-[#F44336] text-white rounded hover:bg-[#d32f2f] transition-colors disabled:opacity-50 font-medium"
                            >
                                {passwordLoading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

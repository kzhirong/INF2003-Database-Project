"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import NavbarClient from "@/components/NavbarClient";
import BlockEditor from "@/components/BlockEditor";
import TimePicker from "@/components/TimePicker";
import { Block } from "@/types/blocks";

export default function EditCCAPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  // Loading state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userEmail, setUserEmail] = useState(""); // Store actual user email from Supabase
  const [userRole, setUserRole] = useState(""); // Store user role for permission checking

  // Fixed/Required fields
  const [name, setName] = useState("");
  const [originalName, setOriginalName] = useState(""); // Store original name for display
  const [category, setCategory] = useState("Sports");
  const [schedule, setSchedule] = useState<Array<{
    day: string;
    startTime: string;
    endTime: string;
    location: string;
  }>>([]);
  const [commitment, setCommitment] = useState("Schedule Based");
  const [sportType, setSportType] = useState("Competitive");

  // Additional Information section
  const [heroImage, setHeroImage] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);

  // Dynamic content blocks
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Fetch existing CCA data on mount
  useEffect(() => {
    fetchUserEmail();
    fetchCCAData();
  }, [resolvedParams.id]);

  const fetchUserEmail = async () => {
    try {
      const { getUserData } = await import("@/lib/auth");
      const userData = await getUserData();
      
      if (userData?.email) {
        setUserEmail(userData.email);
        
        if (userData.role) {
          setUserRole(userData.role);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchCCAData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ccas/${resolvedParams.id}`);
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse CCA data as JSON:", parseError);
        console.error("Response was:", responseText);
        throw new Error("Invalid JSON response from server (Fetch CCA): " + responseText.substring(0, 200));
      }

      if (data.success) {
        const cca = data.data;
        setName(cca.name || "");
        setOriginalName(cca.name || ""); // Store original name for header/email display
        setCategory(cca.category || "Sports");
        setSchedule(cca.schedule || []);
        setCommitment(cca.commitment || "Schedule Based");
        setSportType(cca.sportType || "Competitive");
        setHeroImage(cca.heroImage || "");
        setProfileImage(cca.profileImage || "");
        console.log('=== IMAGE DEBUG ===');
        console.log('Profile Image URL from DB:', cca.profileImage);
        console.log('Profile Image URL type:', typeof cca.profileImage);
        console.log('Profile Image URL length:', cca.profileImage?.length);
        console.log('Hero Image URL from DB:', cca.heroImage);
        console.log('Hero Image URL type:', typeof cca.heroImage);
        console.log('Hero Image URL length:', cca.heroImage?.length);

        // Only set preview if we have a non-empty string
        const heroPreview = (cca.heroImage && typeof cca.heroImage === 'string' && cca.heroImage.trim() !== '') ? cca.heroImage : null;
        const profilePreview = (cca.profileImage && typeof cca.profileImage === 'string' && cca.profileImage.trim() !== '') ? cca.profileImage : null;

        console.log('Setting Hero Preview to:', heroPreview);
        console.log('Setting Profile Preview to:', profilePreview);
        console.log('=== END DEBUG ===');

        setHeroImagePreview(heroPreview);
        setProfileImagePreview(profilePreview);
        setShortDescription(cca.shortDescription || "");
        setBlocks(cca.blocks || []);
      } else {
        alert("Failed to load CCA data");
        router.push("/ccas");
      }
    } catch (error) {
      console.error("Error fetching CCA:", error);
      alert("Error loading CCA");
      router.push("/ccas");
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const categories = ["Sports", "Arts & Culture", "Academic", "Community Service", "Special Interest"];
  const commitmentTypes = ["Schedule Based", "Event Based"];
  const sportTypes = ["Competitive", "Recreational", "Both"];

  const handleScheduleToggle = (day: string) => {
    setSchedule((prev) => {
      const existingIndex = prev.findIndex(s => s.day === day);
      if (existingIndex >= 0) {
        // Remove the day
        return prev.filter(s => s.day !== day);
      } else {
        // Add the day with default time (12:00 PM - 1:00 PM)
        return [...prev, { day, startTime: '12:00', endTime: '13:00', location: '' }];
      }
    });
  };

  const updateScheduleSession = (day: string, field: 'startTime' | 'endTime' | 'location', value: string) => {
    setSchedule((prev) =>
      prev.map(s => s.day === day ? { ...s, [field]: value } : s)
    );
  };

  const handleHeroImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.');
      setTimeout(() => setError(""), 5000);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size exceeds 5MB limit');
      setTimeout(() => setError(""), 5000);
      return;
    }

    // Store file and create preview
    setHeroImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setHeroImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveHeroImage = () => {
    console.log('=== REMOVE HERO IMAGE CLICKED ===');
    console.log('Before remove - heroImage state:', heroImage);
    console.log('Before remove - heroImagePreview:', heroImagePreview);
    console.log('Before remove - heroImageFile:', heroImageFile);

    // Clear all hero image state - user wants to remove the image
    setHeroImageFile(null);
    setHeroImagePreview(null);
    // Mark for deletion by setting to empty string (will be saved on "Save Changes")
    setHeroImage("");

    console.log('After remove - all hero image state cleared');
  };

  const handleProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.');
      setTimeout(() => setError(""), 5000);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size exceeds 5MB limit');
      setTimeout(() => setError(""), 5000);
      return;
    }

    // Store file and create preview
    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfileImage = () => {
    console.log('=== REMOVE PROFILE IMAGE CLICKED ===');
    console.log('Before remove - profileImage state:', profileImage);
    console.log('Before remove - profileImagePreview:', profileImagePreview);
    console.log('Before remove - profileImageFile:', profileImageFile);

    // Clear all profile image state - user wants to remove the image
    setProfileImageFile(null);
    setProfileImagePreview(null);
    // Mark for deletion by setting to empty string (will be saved on "Save Changes")
    setProfileImage("");

    console.log('After remove - all profile image state cleared');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      // Fetch current CCA data from database to get original image URLs
      // We need the database values, not the state values, because state may have been cleared
      let originalHeroImageUrl = "";
      let originalProfileImageUrl = "";
      
      try {
        const response = await fetch(`/api/ccas/${resolvedParams.id}`);
        const data = await response.json();
        if (data.success) {
          originalHeroImageUrl = data.data.heroImage || "";
          originalProfileImageUrl = data.data.profileImage || "";
          console.log('=== FETCHED ORIGINAL URLS FROM DATABASE ===');
          console.log('Original hero image URL:', originalHeroImageUrl);
          console.log('Original profile image URL:', originalProfileImageUrl);
        }
      } catch (fetchError) {
        console.error('Error fetching original image URLs:', fetchError);
        // Continue with save even if fetch fails
      }


      // Upload hero image if a new file is selected
      let uploadedHeroImageUrl = heroImage;
      if (heroImageFile) {
        try {
          console.log('=== HERO IMAGE UPLOAD (REPLACEMENT) ===');
          console.log('Current heroImage state:', heroImage);
          console.log('Original hero image from DB:', originalHeroImageUrl);

          // Delete old hero image from storage if it exists (use originalHeroImageUrl from DB)
          if (originalHeroImageUrl && originalHeroImageUrl.includes('supabase.co/storage')) {
            try {
              // Extract the file path from the URL
              // Format: https://.../storage/v1/object/public/cca-assets/hero-images/filename.png
              const urlParts = originalHeroImageUrl.split('/cca-assets/');
              if (urlParts.length === 2) {
                const oldFilePath = urlParts[1]; // e.g., "hero-images/1234567890-abc.png"

                console.log('Deleting old hero image:', oldFilePath);
                const deleteResponse = await fetch(`/api/upload?path=${encodeURIComponent(oldFilePath)}`, {
                  method: 'DELETE'
                });
                const deleteResult = await deleteResponse.json();
                console.log('Delete result:', deleteResult);

                if (!deleteResult.success) {
                  console.error('Failed to delete old hero image:', deleteResult.error);
                }
              }
            } catch (deleteError) {
              console.error('Error deleting old hero image:', deleteError);
              // Continue with upload even if delete fails
            }
          }

          const formData = new FormData();
          formData.append('file', heroImageFile);
          formData.append('folder', 'hero-images');

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          const uploadData = await uploadResponse.json();

          if (uploadData.success) {
            uploadedHeroImageUrl = uploadData.data.url;
          } else {
            setError(uploadData.error || 'Failed to upload hero image');
            setSaving(false);
            return;
          }
        } catch (uploadError: any) {
          console.error('Error uploading hero image:', uploadError);
          setError('Failed to upload hero image');
          setSaving(false);
          return;
        }
      } else if (heroImage === "" && originalHeroImageUrl && originalHeroImageUrl.includes('supabase.co/storage')) {
        // Hero image is being removed without replacement
        try {
          console.log('=== HERO IMAGE REMOVAL (NO REPLACEMENT) ===');
          console.log('Removing hero image:', originalHeroImageUrl);
          
          const urlParts = originalHeroImageUrl.split('/cca-assets/');
          if (urlParts.length === 2) {
            const oldFilePath = urlParts[1];
            
            console.log('Deleting hero image:', oldFilePath);
            const deleteResponse = await fetch(`/api/upload?path=${encodeURIComponent(oldFilePath)}`, {
              method: 'DELETE'
            });
            const deleteResult = await deleteResponse.json();
            console.log('Delete result:', deleteResult);
            
            if (!deleteResult.success) {
              console.error('Failed to delete hero image:', deleteResult.error);
            }
          }
        } catch (deleteError) {
          console.error('Error deleting hero image:', deleteError);
          // Continue with save even if delete fails
        }
      }

      // Upload profile image if a new file is selected
      let uploadedProfileImageUrl = profileImage;
      if (profileImageFile) {
        try {
          // Delete old profile image from storage if it exists (use originalProfileImageUrl from DB)
          if (originalProfileImageUrl && originalProfileImageUrl.includes('supabase.co/storage')) {
            try {
              // Extract the file path from the URL
              // Format: https://.../storage/v1/object/public/cca-assets/profile-images/filename.png
              const urlParts = originalProfileImageUrl.split('/cca-assets/');
              if (urlParts.length === 2) {
                const oldFilePath = urlParts[1]; // e.g., "profile-images/1234567890-abc.png"

                console.log('Deleting old profile image:', oldFilePath);
                const deleteResponse = await fetch(`/api/upload?path=${encodeURIComponent(oldFilePath)}`, {
                  method: 'DELETE'
                });
                const deleteResult = await deleteResponse.json();
                console.log('Delete result:', deleteResult);

                if (!deleteResult.success) {
                  console.error('Failed to delete old profile image:', deleteResult.error);
                }
              }
            } catch (deleteError) {
              console.error('Error deleting old profile image:', deleteError);
              // Continue with upload even if delete fails
            }
          }

          const formData = new FormData();
          formData.append('file', profileImageFile);
          formData.append('folder', 'profile-images');

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          const uploadData = await uploadResponse.json();

          if (uploadData.success) {
            uploadedProfileImageUrl = uploadData.data.url;
          } else {
            setError(uploadData.error || 'Failed to upload profile image');
            setSaving(false);
            return;
          }
        } catch (uploadError: any) {
          console.error('Error uploading profile image:', uploadError);
          setError('Failed to upload profile image');
          setSaving(false);
          return;
        }
      } else if (profileImage === "" && originalProfileImageUrl && originalProfileImageUrl.includes('supabase.co/storage')) {
        // Profile image is being removed without replacement
        try {
          console.log('=== PROFILE IMAGE REMOVAL (NO REPLACEMENT) ===');
          console.log('Removing profile image:', originalProfileImageUrl);
          
          const urlParts = originalProfileImageUrl.split('/cca-assets/');
          if (urlParts.length === 2) {
            const oldFilePath = urlParts[1];
            
            console.log('Deleting profile image:', oldFilePath);
            const deleteResponse = await fetch(`/api/upload?path=${encodeURIComponent(oldFilePath)}`, {
              method: 'DELETE'
            });
            const deleteResult = await deleteResponse.json();
            console.log('Delete result:', deleteResult);
            
            if (!deleteResult.success) {
              console.error('Failed to delete profile image:', deleteResult.error);
            }
          }
        } catch (deleteError) {
          console.error('Error deleting profile image:', deleteError);
          // Continue with save even if delete fails
        }
      }

      // Validation: Check if Schedule Based is selected but no days are chosen
      if (commitment === "Schedule Based" && schedule.length === 0) {
        setError("Please select at least one day for the schedule.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Auto-dismiss validation error after 5 seconds
        setTimeout(() => {
          setError("");
        }, 5000);
        setSaving(false);
        return;
      }

      // Validation: Check if all schedule entries have time and location filled
      if (commitment === "Schedule Based") {
        const incompleteSchedule = schedule.find(
          s => !s.startTime || !s.endTime || !s.location
        );
        if (incompleteSchedule) {
          setError(`Please fill in start time, end time, and location for ${incompleteSchedule.day}.`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // Auto-dismiss validation error after 5 seconds
          setTimeout(() => {
            setError("");
          }, 5000);
          setSaving(false);
          return;
        }

        // Validation: Check if start time is before end time
        const invalidTimeSchedule = schedule.find(
          s => s.startTime >= s.endTime
        );
        if (invalidTimeSchedule) {
          setError(`Start time must be before end time for ${invalidTimeSchedule.day}.`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // Auto-dismiss validation error after 5 seconds
          setTimeout(() => {
            setError("");
          }, 5000);
          setSaving(false);
          return;
        }
      }

      // Build the CCA data object
      const ccaData: any = {
        _id: resolvedParams.id,
        heroImage: uploadedHeroImageUrl,
        profileImage: uploadedProfileImageUrl,
        shortDescription,
        blocks
      };

      // Structural fields (System Admin only)
      if (userRole === 'system_admin') {
        ccaData.name = name;
        ccaData.category = category;
      }

      // Sport Type (Editable by both System Admin and CCA Admin if category is Sports)
      if (category === "Sports") {
        ccaData.sportType = sportType;
      } else {
        ccaData.sportType = null;
      }

      // Commitment and Schedule (Editable by both System Admin and CCA Admin)
      ccaData.commitment = commitment;
      if (commitment === "Schedule Based") {
        ccaData.schedule = schedule;
      } else {
        ccaData.schedule = null;
      }

      const response = await fetch(`/api/ccas/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ccaData)
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse save response as JSON:", parseError);
        console.error("Response was:", responseText);
        throw new Error("Invalid JSON response from server (Save CCA): " + responseText.substring(0, 200));
      }

      if (data.success) {
        setSuccess("Changes saved successfully!");

        // Clear the file state and update heroImage with the uploaded URL
        if (heroImageFile) {
          console.log('=== UPDATING HERO STATE ===');
          console.log('Setting heroImage to:', uploadedHeroImageUrl);
          setHeroImage(uploadedHeroImageUrl);
          setHeroImageFile(null);
          setHeroImagePreview(uploadedHeroImageUrl);
        }

        // Clear the file state and update profileImage with the uploaded URL
        if (profileImageFile) {
          console.log('=== AFTER SAVE ===');
          console.log('Uploaded Profile Image URL:', uploadedProfileImageUrl);
          console.log('URL type:', typeof uploadedProfileImageUrl);
          console.log('URL length:', uploadedProfileImageUrl?.length);
          setProfileImage(uploadedProfileImageUrl);
          setProfileImageFile(null);
          setProfileImagePreview(uploadedProfileImageUrl);
          console.log('Profile preview state updated to:', uploadedProfileImageUrl);
        }

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (userRole === 'system_admin') {
          // System admin: redirect to CCA detail page after 1.5s
          setTimeout(() => {
            router.push(`/ccas/${resolvedParams.id}`);
          }, 1500);
        } else {
          // CCA admin: auto-dismiss success message after 3 seconds
          setTimeout(() => {
            setSuccess("");
          }, 3000);
        }
      } else {
        setError(data.error || "Failed to save changes");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Auto-dismiss error after 5 seconds for both roles
        setTimeout(() => {
          setError("");
        }, 5000);
      }
    } catch (error: any) {
      console.error("Error saving CCA:", error);
      setError(error.message || "Failed to save changes");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Auto-dismiss error after 5 seconds for both roles
      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F44336] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CCA data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      <NavbarClient />

      <main className="py-8">
        {/* Header Section */}
        {/* Header Section */}
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 mb-8">
          {userRole === 'system_admin' ? (
            <>
              {/* Tab Navigation (Replicated from Admin Dashboard) */}
              <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
                <button
                  onClick={() => router.push('/admin')}
                  className="px-6 py-3 font-semibold text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
                >
                  Register Student
                </button>
                <button
                  onClick={() => router.push('/admin')}
                  className="px-6 py-3 font-semibold text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
                >
                  Register CCA Admin
                </button>
                <button
                  className="px-6 py-3 font-semibold text-[#F44336] border-b-2 border-[#F44336] transition-colors whitespace-nowrap"
                >
                  Manage CCAs
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Manage CCA: {name || 'Loading...'}</h1>
                  <p className="text-gray-600 mt-1">Edit CCA details and settings</p>
                </div>
                {/* Back button removed as per request */}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-6">
              {/* Left: Profile Picture and User Info */}
              <div className="flex items-center gap-6">
                {/* Profile Picture - Clickable to upload */}
                <div className="relative group flex-shrink-0 bg-transparent">
                  <input
                    type="file"
                    id="profile-image-upload"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleProfileImageSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className="block cursor-pointer relative bg-transparent"
                  >
                    {profileImagePreview ? (
                      <div className="w-24 h-24 rounded-full overflow-hidden relative border-2 border-gray-300 bg-white flex items-center justify-center">
                        <img
                          src={profileImagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          style={{ objectPosition: 'center center' }}
                          onError={(e) => {
                            console.error('Failed to load profile image:', profileImagePreview);
                            // On error, clear the preview to show initials instead
                            setProfileImagePreview(null);
                          }}
                        />
                        {/* Hover overlay - positioned absolutely OVER the image */}
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity flex items-center justify-center rounded-full">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center z-10">
                              <svg
                                className="w-8 h-8 text-white mx-auto mb-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              <span className="text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">Change</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl font-bold text-gray-600 border-2 border-gray-300 relative">
                        {(() => {
                          const ccaName = originalName || 'CCA';
                          const names = ccaName.trim().split(' ');
                          if (names.length >= 2) {
                            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
                          }
                          return ccaName.substring(0, 2).toUpperCase();
                        })()}
                        {/* Hover overlay with camera icon */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-full flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                            <svg
                              className="w-8 h-8 text-white mx-auto mb-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="text-white text-[10px] font-medium">Upload</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </label>
                </div>

                {/* User Info */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-black mb-1">
                    {originalName || 'CCA ADMIN'}
                  </h2>
                  <p className="text-base md:text-lg text-gray-600">
                    {userEmail || 'Loading...'}
                  </p>
                </div>
              </div>

              {/* Right: Tab Navigation Buttons - Moved to Navbar */}
              <div className="hidden md:flex items-center gap-4">
              </div>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-8 md:px-16 lg:px-24">
          {/* Page Header for CCA Admin */}
          {userRole !== 'system_admin' && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Manage CCA</h1>
              <p className="text-gray-600 mt-1">Customize how students view your CCA page and manage your schedule</p>
            </div>
          )}

          {/* Success/Error Messages */}
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="space-y-8">
            {/* Fixed Information Section */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#F44336]">
                Required Information
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                These fields are required for filtering and categorization
              </p>

              <div className="space-y-6">
                {/* CCA Name */}
                {userRole === 'cca_admin' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CCA Name *
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 flex items-center justify-between">
                      <span>{originalName}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                        </svg>
                        Read-only
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Contact System Admin to change</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CCA Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                      placeholder="e.g., BASKETBALL"
                    />
                  </div>
                )}

                {/* Category */}
                {userRole === 'cca_admin' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 flex items-center justify-between">
                      <span>{category}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                        </svg>
                        Read-only
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Contact System Admin to change</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        const newCategory = e.target.value;
                        setCategory(newCategory);
                        // Reset sportType to default if changing away from Sports
                        if (newCategory !== "Sports") {
                          setSportType("Competitive");
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sport Type (conditional - directly under Category since they're related) */}
                {category === "Sports" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sport Type *
                    </label>
                    <select
                      value={sportType}
                      onChange={(e) => setSportType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                    >
                      {sportTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Commitment Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Commitment Type *
                    </label>
                    <select
                      value={commitment}
                      onChange={(e) => {
                        const newCommitment = e.target.value;
                        setCommitment(newCommitment);
                        // Clear schedule if changing to Flexible or Event Based
                        if (newCommitment !== "Schedule Based") {
                          setSchedule([]);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                    >
                      {commitmentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                {/* Schedule (conditional - only show when Schedule Based) */}
                {commitment === "Schedule Based" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Schedule *
                    </label>
                    <div className="space-y-4">
                      {/* Day Selection Buttons */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {daysOfWeek.map((day) => {
                          const isSelected = schedule.some(s => s.day === day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleScheduleToggle(day)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border cursor-pointer ${
                                isSelected
                                  ? 'bg-[#F44336] text-white border-[#F44336]'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Days Forms */}
                      <div className="space-y-4">
                        {daysOfWeek.map((day) => {
                          const session = schedule.find(s => s.day === day);
                          if (!session) return null;

                          return (
                            <div key={day} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-[#F44336] rounded-full"></span>
                                {day}
                              </h4>
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Start Time *
                                    </label>
                                    <TimePicker
                                      value={session.startTime}
                                      onChange={(val) => updateScheduleSession(day, 'startTime', val)}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      End Time *
                                    </label>
                                    <TimePicker
                                      value={session.endTime}
                                      onChange={(val) => updateScheduleSession(day, 'endTime', val)}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Location *
                                  </label>
                                  <input
                                    type="text"
                                    value={session.location}
                                    onChange={(e) => updateScheduleSession(day, 'location', e.target.value)}
                                    placeholder="e.g., Sports Hall, Level 1"
                                    required
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#F44336]">
                Additional Information
              </h2>

              <div className="space-y-6">
                {/* Hero Banner Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hero Banner
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Recommended ratio: 3:1 (e.g., 1200x400px) • Max file size: 5MB • Formats: JPEG, PNG, GIF, WebP
                  </p>

                  {heroImagePreview ? (
                    <div className="space-y-3">
                      {/* Image Preview - 3:1 aspect ratio */}
                      <div className="relative w-full aspect-[3/1] border-2 border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={heroImagePreview}
                          alt="Hero banner preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={handleRemoveHeroImage}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        id="hero-image-upload"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleHeroImageSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="hero-image-upload"
                        className="flex flex-col items-center justify-center w-full aspect-[3/1] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#F44336] hover:bg-gray-50 transition-colors"
                      >
                        <svg
                          className="w-12 h-12 text-gray-400 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-semibold text-[#F44336]">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">JPEG, PNG, GIF or WebP (max 5MB)</p>
                      </label>
                    </div>
                  )}
                </div>

                {/* About Us */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    About Us
                  </label>
                  <textarea
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                    placeholder="Write a brief description about the CCA"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be displayed prominently on your CCA page
                  </p>
                </div>
              </div>
            </div>

            {/* Page Content Builder */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-[#F44336]">
                Page Content
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Build your CCA page by adding, removing, and reordering content blocks
              </p>

              <BlockEditor blocks={blocks} onBlocksChange={setBlocks} />
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={`w-full px-8 py-4 rounded-lg font-semibold text-lg transition-colors cursor-pointer ${
                  saving
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#F44336] text-white hover:bg-[#D32F2F]"
                }`}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

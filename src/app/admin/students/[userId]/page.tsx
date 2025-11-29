"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import NavbarClient from "@/components/NavbarClient";
import { getUserData } from "@/lib/auth";

export default function AdminEditStudentPage({ params }: { params: Promise<{ userId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);

  // Loading state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [courseId, setCourseId] = useState("");
  const [password, setPassword] = useState("");

  // Courses list
  const [courses, setCourses] = useState<Array<{id: string, course_name: string}>>([]);

  // Message state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    checkAdminAccess();
    fetchCourses();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const userData = await getUserData();
      if (!userData || userData.role !== "system_admin") {
        router.push("/");
        return;
      }
      setIsAdmin(true);
      fetchData();
    } catch (err) {
      router.push("/");
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/students/${resolvedParams.userId}`);
      const data = await response.json();

      if (data.success) {
        const student = data.data;
        setName(student.name || "");
        setStudentId(student.student_id || "");
        setEmail(student.email || "");
        setPhoneNumber(student.phone_number || "");
        setCourseId(student.course_id || "");
      } else {
        setError("Failed to load student data");
        setTimeout(() => router.push("/admin"), 2000);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error loading data");
      setTimeout(() => router.push("/admin"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    try {
      setSaving(true);

      const response = await fetch(`/api/admin/students/${resolvedParams.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          student_id: studentId,
          email,
          phone_number: phoneNumber,
          course_id: courseId,
          password: password || undefined
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to update student details");
      }

      setSuccess("Changes saved successfully!");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setPassword(""); // Clear password field after successful save
    } catch (error: any) {
      console.error("Error saving changes:", error);
      setError(error.message || "Failed to save changes");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F44336] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarClient />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Student Details</h1>
            <p className="text-gray-600 mt-1">Update information for {name}</p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>

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

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          
          {/* Student Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 pb-2 border-b-2 border-[#F44336]">
              Student Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., John Doe"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Student ID *
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g., 2402498"
                  required
                  pattern="\d{7}"
                  maxLength={7}
                  title="Student ID must be exactly 7 digits"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course *
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
              >
                <option value="">
                  {courses.length === 0 ? 'Loading courses...' : 'Select Course'}
                </option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., 81234567"
                pattern="[89]\d{7}"
                maxLength={8}
                required
                title="Phone number must be 8 digits starting with 8 or 9"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
              />
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 pb-2 border-b-2 border-[#F44336]">
              Account Information
            </h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., 2402498@sit.singaporetech.edu.sg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#F44336] hover:bg-[#D32F2F] cursor-pointer"
              }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

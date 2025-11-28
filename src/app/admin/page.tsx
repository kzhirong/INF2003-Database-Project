"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserData } from "@/lib/auth";
import NavbarClient from "@/components/NavbarClient";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"students" | "ccas" | "manage">("students");

  // Constants for CCA form
  const categories = ["Sports", "Arts & Culture", "Community Service", "Academic", "Special Interest"];
  const commitmentTypes = ["Schedule Based", "Flexible", "Event Based"];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const sportTypes = ["Competitive", "Recreational", "Both"];

  // Student form
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentCourseId, setStudentCourseId] = useState("");
  const [studentPhone, setStudentPhone] = useState("");

  // Courses list from database
  const [courses, setCourses] = useState<Array<{id: string, course_name: string}>>([]);

  // CCA form
  const [ccaEmail, setCcaEmail] = useState("");
  const [ccaPassword, setCcaPassword] = useState("");
  const [ccaName, setCcaName] = useState("");
  const [ccaCategory, setCcaCategory] = useState("Sports");
  const [ccaCommitment, setCcaCommitment] = useState("Schedule Based");
  const [ccaSchedule, setCcaSchedule] = useState<string[]>([]);
  const [ccaSportType, setCcaSportType] = useState("Competitive");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // CCA Management state
  const [ccaList, setCcaList] = useState<any[]>([]);
  const [loadingCcas, setLoadingCcas] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (activeTab === "manage") {
      fetchCcas();
    }
  }, [activeTab]);

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const checkAdminAccess = async () => {
    try {
      const userData = await getUserData();

      if (!userData || userData.role !== "system_admin") {
        router.push("/");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    } catch (err) {
      router.push("/");
    }
  };

  const fetchCcas = async () => {
    setLoadingCcas(true);
    try {
      const response = await fetch('/api/ccas');
      const data = await response.json();
      if (data.success) {
        setCcaList(data.data);
      }
    } catch (err) {
      console.error("Error fetching CCAs:", err);
    } finally {
      setLoadingCcas(false);
    }
  };

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses...');
      const response = await fetch('/api/courses');
      const data = await response.json();
      console.log('Courses response:', data);
      if (data.success) {
        console.log('Setting courses:', data.data);
        setCourses(data.data);
      } else {
        console.error('Failed to fetch courses:', data.error);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const handleDeleteCca = async (ccaId: string, ccaName: string) => {
    if (!confirm(`Are you sure you want to delete "${ccaName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/ccas/${ccaId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setSuccess(`CCA "${ccaName}" deleted successfully!`);
        fetchCcas(); // Refresh the list
      } else {
        setError(`Failed to delete CCA: ${data.error}`);
      }
    } catch (err: any) {
      setError(`Failed to delete CCA: ${err.message}`);
    }
  };



  const handleScheduleToggle = (day: string) => {
    setCcaSchedule((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      // Check for existing Student ID and Phone Number
      const checkResponse = await fetch('/api/admin/check-student-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          phone_number: studentPhone,
        }),
      });

      const checkData = await checkResponse.json();

      if (!checkData.success) {
        setError(checkData.error || "Failed to validate student data");
        setSubmitting(false);
        return;
      }

      if (checkData.exists) {
        const errors = [];
        if (checkData.studentIdExists) errors.push("Student ID already exists");
        if (checkData.phoneExists) errors.push("Phone number already exists");
        setError(errors.join(". "));
        setSubmitting(false);
        return;
      }

      // Use admin API to create user without affecting current session
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: studentEmail,
          password: studentPassword,
          role: "student",
          name: studentName,
          student_id: studentId,
          course_id: studentCourseId,
          phone_number: studentPhone,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error("Student creation error:", data);
        setError(data.error || "Failed to create student account");
        setSubmitting(false);
        return;
      }

      setSuccess(`Student account created successfully for ${studentName}!`);
      // Clear form
      setStudentEmail("");
      setStudentPassword("");
      setStudentName("");
      setStudentId("");
      setStudentCourseId("");
      setStudentPhone("");
      setSubmitting(false);
    } catch (err: any) {
      console.error("Student creation error:", err);
      setError(err.message || "Failed to create student account");
      setSubmitting(false);
    }
  };

  const handleCreateCCA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      console.log("Step 1: Creating CCA in MongoDB...");
      // Step 1: Create the CCA in MongoDB first
      const createCCAResponse = await fetch('/api/ccas', {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ccaName,
          category: ccaCategory,
          schedule: ccaCommitment === "Schedule Based" ? ccaSchedule : [],
          commitment: ccaCommitment,
          sportType: ccaCategory === "Sports" ? ccaSportType : undefined,
          heroImage: '',
          shortDescription: `Welcome to ${ccaName}!`,
          meetingDetails: {
            time: 'TBD',
            location: 'TBD',
            contactEmail: ccaEmail,
          },
          stats: {
            currentMembers: 0,
            maxMembers: 30,
          },
          blocks: [],
        }),
      });

      console.log("CCA Response status:", createCCAResponse.status);

      // Get the response text first to see what we're actually receiving
      const responseText = await createCCAResponse.text();
      console.log("CCA Response text:", responseText);

      // Try to parse it as JSON
      let ccaData;
      try {
        ccaData = JSON.parse(responseText);
        console.log("CCA Response data (parsed):", ccaData);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        console.error("Response was:", responseText);
        throw new Error("Invalid JSON response from server: " + responseText.substring(0, 200));
      }

      if (!ccaData.success) {
        console.error("CCA creation failed:", ccaData);
        setError("Failed to create CCA: " + (ccaData.error || JSON.stringify(ccaData)));
        setSubmitting(false);
        return;
      }

      const newCcaId = ccaData.data._id;
      console.log("CCA created successfully with ID:", newCcaId);

      // Step 2: Create the CCA admin user account using admin API
      console.log("Step 2: Creating CCA admin user account...");
      const createUserResponse = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ccaEmail,
          password: ccaPassword,
          role: "cca_admin",
          name: ccaName,
          cca_id: newCcaId,
        }),
      });

      const userData = await createUserResponse.json();
      console.log("Create user response:", userData);

      if (!userData.success) {
        console.error("User creation error:", userData);
        setError("CCA created, but failed to create admin account: " + (userData.error || JSON.stringify(userData)));
        setSubmitting(false);
        return;
      }

      console.log("All steps completed successfully!");
      setSuccess(`CCA "${ccaName}" and admin account created successfully! CCA ID: ${newCcaId}`);
      // Clear form
      setCcaEmail("");
      setCcaPassword("");
      setCcaName("");
      setCcaCategory("Sports");
      setCcaCommitment("Schedule Based");
      setCcaSchedule([]);
      setCcaSportType("Competitive");
      setSubmitting(false);
    } catch (err: any) {
      console.error("Create CCA error (caught):", err);
      console.error("Error stack:", err.stack);
      setError(err.message || "Failed to create CCA and admin account");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#F44336] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarClient />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("students")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "students"
                ? "text-[#F44336] border-b-2 border-[#F44336]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Register Student
          </button>
          <button
            onClick={() => setActiveTab("ccas")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "ccas"
                ? "text-[#F44336] border-b-2 border-[#F44336]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Register CCA Admin
          </button>
          <button
            onClick={() => setActiveTab("manage")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "manage"
                ? "text-[#F44336] border-b-2 border-[#F44336]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Manage CCAs
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

        {/* Student Registration Form */}
        {activeTab === "students" && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Student Account</h2>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 text-sm font-semibold mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F44336]"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 text-sm font-semibold mb-2">
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F44336]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-900 text-sm font-semibold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="e.g., 2402498@sit.singaporetech.edu.sg"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F44336]"
                />
              </div>

              <div>
                <label className="block text-gray-900 text-sm font-semibold mb-2">
                  Course *
                </label>
                <select
                  value={studentCourseId}
                  onChange={(e) => setStudentCourseId(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F44336]"
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
                <label className="block text-gray-900 text-sm font-semibold mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="e.g., 81234567"
                  pattern="[89]\d{7}"
                  maxLength={8}
                  required
                  title="Phone number must be 8 digits starting with 8 or 9"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F44336]"
                />
              </div>

              <div>
                <label className="block text-gray-900 text-sm font-semibold mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F44336]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#F44336] hover:bg-[#D32F2F] text-white font-semibold py-3 px-8 rounded-lg transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating Account..." : "Create Student Account"}
              </button>
            </form>
          </div>
        )}

        {/* CCA Admin Registration Form */}
        {activeTab === "ccas" && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create CCA Admin Account</h2>
            <form onSubmit={handleCreateCCA} className="space-y-6">
              {/* Required Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 pb-2 border-b-2 border-[#F44336]">
                  Required Information
                </h3>
                <p className="text-sm text-gray-500">
                  These fields are required for filtering and categorization
                </p>

                {/* CCA Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CCA Name *
                  </label>
                  <input
                    type="text"
                    value={ccaName}
                    onChange={(e) => setCcaName(e.target.value)}
                    placeholder="e.g., BASKETBALL"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={ccaCategory}
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      setCcaCategory(newCategory);
                      if (newCategory !== "Sports") {
                        setCcaSportType("Competitive");
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

                {/* Sport Type (conditional - directly under Category since they're related) */}
                {ccaCategory === "Sports" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sport Type *
                    </label>
                    <select
                      value={ccaSportType}
                      onChange={(e) => setCcaSportType(e.target.value)}
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
                    value={ccaCommitment}
                    onChange={(e) => {
                      const newCommitment = e.target.value;
                      setCcaCommitment(newCommitment);
                      if (newCommitment !== "Schedule Based") {
                        setCcaSchedule([]);
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
                {ccaCommitment === "Schedule Based" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Schedule *
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleScheduleToggle(day)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            ccaSchedule.includes(day)
                              ? "bg-[#F44336] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Account Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 pb-2 border-b-2 border-[#F44336]">
                  Account Details
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={ccaEmail}
                    onChange={(e) => setCcaEmail(e.target.value)}
                    placeholder="basketball@sit.singaporetech.edu.sg"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={ccaPassword}
                    onChange={(e) => setCcaPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#F44336] focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#F44336] hover:bg-[#D32F2F] text-white font-semibold py-3 px-8 rounded-lg transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Creating Account..." : "Create CCA Admin Account"}
              </button>
            </form>
          </div>
        )}

        {/* Manage CCAs Tab */}
        {activeTab === "manage" && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage CCAs</h2>

            {loadingCcas ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#F44336] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading CCAs...</p>
              </div>
            ) : ccaList.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No CCAs found. Create a CCA admin to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CCA Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Email
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ccaList.map((cca) => (
                      <tr key={cca._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{cca.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{cca.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {cca.stats?.currentMembers || 0} / {cca.stats?.maxMembers || 30}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{cca.meetingDetails?.contactEmail || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/admin/ccas/${cca._id}`}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit Details
                          </Link>
                          <button
                            onClick={() => handleDeleteCca(cca._id, cca.name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

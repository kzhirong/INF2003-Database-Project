"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [course, setCourse] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            student_id: studentId,
            course: course,
            year_of_study: yearOfStudy,
            phone_number: phoneNumber,
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        // Successfully signed up - user will be created with default 'student' role via trigger
        alert("Account created successfully! Please login.");
        router.push("/");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during signup");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up for CCA Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-gray-900 text-sm font-semibold mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-4 py-3 bg-[#FFF6F4] border-none rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F44336]"
            />
          </div>

          <div>
            <label htmlFor="studentId" className="block text-gray-900 text-sm font-semibold mb-2">
              Student ID *
            </label>
            <input
              type="text"
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="2402498"
              required
              className="w-full px-4 py-3 bg-[#FFF6F4] border-none rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F44336]"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-900 text-sm font-semibold mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@sit.singaporetech.edu.sg"
              required
              className="w-full px-4 py-3 bg-[#FFF6F4] border-none rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F44336]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="course" className="block text-gray-900 text-sm font-semibold mb-2">
                Course
              </label>
              <input
                type="text"
                id="course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Information Security"
                className="w-full px-4 py-3 bg-[#FFF6F4] border-none rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F44336]"
              />
            </div>

            <div>
              <label htmlFor="yearOfStudy" className="block text-gray-900 text-sm font-semibold mb-2">
                Year of Study
              </label>
              <select
                id="yearOfStudy"
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full px-4 py-3 bg-[#FFF6F4] border-none rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F44336]"
              >
                <option value="">Select</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-gray-900 text-sm font-semibold mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+65 1234 5678"
              className="w-full px-4 py-3 bg-[#FFF6F4] border-none rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F44336]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-900 text-sm font-semibold mb-2">
              Password *
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-3 bg-[#FFF6F4] border-none rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F44336]"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-900 text-sm font-semibold mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-3 bg-[#FFF6F4] border-none rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F44336]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#F44336] hover:bg-[#FF8A80] text-white font-semibold py-3 px-8 rounded-full transition-colors duration-200 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "CREATING ACCOUNT..." : "SIGN UP"}
          </button>

          <p className="text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <Link href="/" className="text-[#F44336] hover:underline font-semibold">
              Login here
            </Link>
          </p>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Note:</strong> New accounts are created as Student accounts by default.
          </p>
          <p className="text-sm text-gray-600">
            If you need a CCA Admin account, please contact the system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

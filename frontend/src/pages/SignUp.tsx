import axios from "axios";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await signup({
        name,
        email,
        password,
      });

      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create account";

        setError(message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#111318] px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-[#343941] bg-[#1B1F26] p-5 shadow-xl sm:p-8">
        <h1 className="mb-2 text-2xl font-bold text-[#F4F4F5]">
          Create an account
        </h1>

        <p className="mb-6 text-sm text-[#A1A1AA]">
          Get started with TaskFlow and stay organized.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-[#343941] bg-[#111318] px-3 py-2.5 text-sm text-[#F4F4F5] placeholder:text-[#71717A] outline-none transition-colors focus:border-[#6B7280] focus:ring-2 focus:ring-[#6B7280]/20"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[#343941] bg-[#111318] px-3 py-2.5 text-sm text-[#F4F4F5] placeholder:text-[#71717A] outline-none transition-colors focus:border-[#6B7280] focus:ring-2 focus:ring-[#6B7280]/20"
              placeholder="johndoe123@gmail.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[#343941] bg-[#111318] px-3 py-2.5 text-sm text-[#F4F4F5] placeholder:text-[#71717A] outline-none transition-colors focus:border-[#6B7280] focus:ring-2 focus:ring-[#6B7280]/20"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-[#F4F4F5] px-4 py-2.5 text-sm font-semibold text-[#111318] transition-colors hover:bg-[#D4D4D8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#A1A1AA] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#A1A1AA]">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-medium text-[#93B4FF] transition-colors hover:text-[#BFDBFE] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#93B4FF]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

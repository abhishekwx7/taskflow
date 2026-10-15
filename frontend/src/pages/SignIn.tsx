import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SigninPage() {
  const { signin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await signin({
        email,
        password,
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Invalid email or password";

        setError(message);
      } else {
        setError("Something went wrong!");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#111318] px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-[#343941] bg-[#1B1F26] p-5 shadow-xl sm:p-8">
        <h1 className="mb-2 text-2xl font-bold text-[#F4F4F5]">Welcome back</h1>

        <p className="mb-6 text-sm text-[#A1A1AA]">
          Sign in to manage your tasks.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#E4E4E7]">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[#343941] bg-[#111318] px-3 py-2.5 text-sm text-[#F4F4F5] placeholder:text-[#71717A] outline-none transition-colors focus:border-[#6B7280] focus:ring-2 focus:ring-[#6B7280]/20"
              placeholder="john123@gmail.com"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#E4E4E7]">
              Password
            </label>

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
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#A1A1AA]">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-[#93B4FF] transition-colors hover:text-[#BFDBFE] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#93B4FF]"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

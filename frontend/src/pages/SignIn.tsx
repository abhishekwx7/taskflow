import axios from "axios";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCheck, LockKeyhole, Mail } from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function SigninPage() {
  const { signin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#0F1117] px-4 py-10 text-[#F4F5F8] antialiased sm:px-6">
      {/* Subtle Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[110px]"
      />

      {/* Branding */}
      <Link
        to="/"
        className="relative z-10 mb-8 flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#252B3A]">
          <CheckCheck size={21} className="text-[#F4F5F8]" />
        </span>

        <span className="text-xl font-bold tracking-tight text-[#F4F5F8]">
          TaskFlow
        </span>
      </Link>

      {/* Sign In Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#2B3040] bg-[#1A1E29] p-5 shadow-2xl shadow-black/25 sm:p-8">
        {/* Heading */}
        <div className="mb-7">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#30394C] bg-[#192235] px-3 py-1.5 text-xs font-medium text-[#9BBEFF]">
            Welcome back
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#F4F5F8] sm:text-3xl">
            Sign in to TaskFlow
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#9CA3B5]">
            Pick up where you left off and keep making progress.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label
              htmlFor="signin-email"
              className="mb-2 block text-sm font-medium text-[#E9ECF3]"
            >
              Email address
            </label>

            <div className="relative">
              <Mail
                size={17}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858DA0]"
              />

              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-12 w-full rounded-xl border border-[#303543] bg-[#141821] py-3 pl-11 pr-4 text-base text-[#F4F5F8] outline-none transition-colors placeholder:text-[#767F92] focus:border-[#729EFF] focus:ring-2 focus:ring-blue-500/15 sm:text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="signin-password"
              className="mb-2 block text-sm font-medium text-[#E9ECF3]"
            >
              Password
            </label>

            <div className="relative">
              <LockKeyhole
                size={17}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858DA0]"
              />

              <input
                id="signin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-12 w-full rounded-xl border border-[#303543] bg-[#141821] py-3 pl-11 pr-4 text-base text-[#F4F5F8] outline-none transition-colors placeholder:text-[#767F92] focus:border-[#729EFF] focus:ring-2 focus:ring-blue-500/15 sm:text-sm"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F4F5F8] px-4 text-sm font-semibold text-[#0F1117] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              "Signing in..."
            ) : (
              <>
                Sign in
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-7 text-center text-sm text-[#9CA3B5]">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-[#A7BFFF] transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            Create an account
          </Link>
        </p>
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-center text-xs text-[#858DA0]">
        Less chaos. More progress.
      </p>
    </div>
  );
}

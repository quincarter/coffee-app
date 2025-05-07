import { getSession } from "../lib/session";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

type SearchParams = {
  registered?: string;
  reset?: string;
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Check if user is already logged in
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const registered = params.registered === "true";
  const reset = params.reset === "success";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 z-0">
        <img
          src="/chemex-brewing-landing.png"
          alt="Coffee brewing background"
          className="object-cover opacity-80 w-full h-full"
        />
      </div>
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md bg-base-100/90 relative z-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-600 coffee:text-gray-400">
            Or{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              create a new account
            </a>
          </p>
        </div>

        <LoginForm
          successMessage={
            registered
              ? "Account created successfully! Please sign in."
              : reset
                ? "Password reset successful! Please sign in."
                : null
          }
        />
      </div>
    </div>
  );
}

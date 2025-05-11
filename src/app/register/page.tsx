import { getSession } from "../lib/session";
import Image from "next/image";
import { redirect } from "next/navigation";
import RegisterForm from "@/app/register/RegisterForm";
import AdminBanner from "../components/AdminBanner";

export default async function RegisterPage() {
  // Check if user is already logged in
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 relative">
      <div className="w-full space-y-8 shadow-md bg-base-100 rounded-md relative z-10 mb-6">
        <AdminBanner />
      </div>
      <div className="absolute inset-0 z-0">
        <Image
          src="/chemex-brewing-landing.png"
          alt="Coffee brewing background"
          className="object-cover opacity-80 w-full h-full"
          fill
        />
      </div>
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-md bg-base-100/90 relative z-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600 coffee:text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}

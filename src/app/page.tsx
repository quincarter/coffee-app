import Image from "next/image";
import Link from "next/link";
import { getSession } from "./lib/session";
import { redirect } from "next/navigation";
import PublicBrews from "./components/PublicBrews";

export default async function Home() {
  const session = await getSession();

  // Redirect logged-in users to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center relative">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src="/chemex-brewing-landing.png"
            alt="Coffee brewing background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary">
            Track Your Perfect Brew
          </h1>
          <p className="text-xl mb-8 text-base-content/80">
            The ultimate companion for coffee enthusiasts to log, track, and
            perfect their brewing journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
            <Link href="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">
            Brew Better Coffee
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h3 className="card-title text-secondary">Track Your Brews</h3>
                <p>
                  Log every detail of your coffee brewing process, from beans to
                  water ratio, temperature, and more.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h3 className="card-title text-secondary">Manage Devices</h3>
                <p>
                  Keep track of all your brewing equipment and their specific
                  settings for consistent results.
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h3 className="card-title text-secondary">Discover Patterns</h3>
                <p>
                  Analyze your brewing history to find what works best for your
                  taste preferences.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h3 className="card-title text-secondary">
                  Measure Everything
                </h3>
                <p>Calculate your coffee-to-water ratio for optimal flavor.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Brews Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">
            See What Others Are Brewing
          </h2>
          <PublicBrews />
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-primary">
            What Coffee Lovers Say
          </h2>

          <div className="card bg-base-200 shadow-lg">
            <div className="card-body">
              <p className="text-lg italic mb-4">
                &quot;This app has completely transformed my morning coffee
                routine. I&apos;m brewing better coffee than ever before!&quot;
              </p>
              <p className="font-semibold">— Coffee Enthusiast</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-content text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Perfect Your Coffee?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of coffee lovers who have elevated their brewing
            experience.
          </p>
          <Link
            href="/register"
            className="btn btn-lg bg-base-100 text-primary hover:bg-base-200"
          >
            Start Your Coffee Journey
          </Link>
        </div>
      </section>
    </div>
  );
}

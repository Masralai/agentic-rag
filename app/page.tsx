import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Hero } from "./_components/landing/hero";
import { Features } from "./_components/landing/features";
import { HowItWorks } from "./_components/landing/how-it-works";
import { Cta } from "./_components/landing/cta";
import { Footer } from "./_components/landing/footer";

export default async function LandingPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/nodes");
  }

  return (
    <>
      <div className="grain" />
      <main className="min-h-screen bg-black text-white">
        <Hero />
        <Features />
        <HowItWorks />
        <Cta />
        <Footer />
      </main>
    </>
  );
}

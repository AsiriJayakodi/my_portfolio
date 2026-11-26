import Hero from "@/components/Hero/Hero";
import About from "@/components/About/About";
import HeroAboutStage from "@/components/HeroAboutStage/HeroAboutStage";
import Skills from "@/components/Skills/Skills";
import Projects from "@/components/Projects/Projects";
import Experience from "@/components/Experience/Experience";
import BlogArticle from "@/components/BlogArticle/BlogArticle";
import Contact from "@/components/Contact/Contact";
import FloatingBrandLogo from "@/components/FloatingBrandLogo/FloatingBrandLogo";
import connectToDatabase from "@/lib/db";
import Profile from "@/models/Profile";

export const dynamic = "force-dynamic";

export default async function Home() {
  let logoUrl = "";
  try {
    await connectToDatabase();
    const profile = await Profile.findOne({}, { logoUrl: 1 }).lean<{ logoUrl?: string }>();
    if (profile?.logoUrl) {
      logoUrl = profile.logoUrl;
    }
  } catch {
    // Fallback to client fetch if DB read fails
  }

  return (
    <main>
      <FloatingBrandLogo initialLogoUrl={logoUrl} />
      <HeroAboutStage
        hero={<Hero isAdmin={false} />}
        about={<About sectionId="about-content" />}
        next={<Skills isAdmin={false} />}
      />
      <Projects isAdmin={false} />
      <Experience />
      <BlogArticle isAdmin={false} />
      <Contact />
    </main>
  );
}

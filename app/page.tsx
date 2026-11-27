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
import SiteAsset from "@/models/SiteAsset";

export const dynamic = "force-dynamic";

const globalForHero = globalThis as typeof globalThis & {
  __cachedHeroImageSrc?: string;
};

async function getInitialPageAssets() {
  let logoUrl = "";
  let heroImageSrc = globalForHero.__cachedHeroImageSrc || "/api/assets/profile-hero.png";
  try {
    await connectToDatabase();
    const [profile, heroAsset] = await Promise.all([
      Profile.findOne({}, { logoUrl: 1 }).lean<{ logoUrl?: string }>(),
      globalForHero.__cachedHeroImageSrc
        ? Promise.resolve(null)
        : SiteAsset.findOne({ name: "profile-hero.png" }, { contentType: 1, base64: 1 }).lean<{
            contentType?: string;
            base64?: string;
          }>(),
    ]);
    if (profile?.logoUrl) {
      logoUrl = profile.logoUrl;
    }
    if (heroAsset?.base64 && heroAsset?.contentType) {
      heroImageSrc = `data:${heroAsset.contentType};base64,${heroAsset.base64}`;
      globalForHero.__cachedHeroImageSrc = heroImageSrc;
    }
  } catch {
    // Fallback to client/API fetch if DB read fails
  }
  return { logoUrl, heroImageSrc };
}

export default async function Home() {
  const { logoUrl, heroImageSrc } = await getInitialPageAssets();

  return (
    <main>
      <FloatingBrandLogo initialLogoUrl={logoUrl} />
      <HeroAboutStage
        hero={<Hero isAdmin={false} initialHeroImageSrc={heroImageSrc} />}
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

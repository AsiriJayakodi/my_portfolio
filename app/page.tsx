import Hero from "@/components/Hero/Hero";
import About from "@/components/About/About";
import HeroAboutStage from "@/components/HeroAboutStage/HeroAboutStage";
import Skills from "@/components/Skills/Skills";
import Projects from "@/components/Projects/Projects";
import Experience from "@/components/Experience/Experience";
import BlogArticle from "@/components/BlogArticle/BlogArticle";
import Contact from "@/components/Contact/Contact";
export default function Home() {
  return (
    <main>
      <HeroAboutStage
        hero={<Hero isAdmin={false} />}
        about={<About sectionId="about-content" />}
      />
      <Skills isAdmin={false} />
      <Projects isAdmin={false} />
      <Experience />
      <BlogArticle isAdmin={false} />
      <Contact />
    </main>
  );
}


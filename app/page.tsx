import Hero from "@/components/Hero/Hero";
import About from "@/components/About/About";
import Skills from "@/components/Skills/Skills";
import Projects from "@/components/Projects/Projects";
import Experience from "@/components/Experience/Experience";
import BlogArticle from "@/components/BlogArticle/BlogArticle";
import Contact from "@/components/Contact/Contact";
export default function Home() {
  return (
    <main>
      <Hero isAdmin={false} />
      <About />
      <Skills isAdmin={false} />
      <Projects isAdmin={false} />
      <Experience />
      <BlogArticle isAdmin={false} />
      <Contact />
    </main>
  );
}


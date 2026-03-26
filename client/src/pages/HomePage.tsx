import FeaturesSectionDemo from "../components/features";
import { Footer } from "../components/home/Footer";
import { Hero } from "../components/home/Hero";
import { HomeNav } from "../components/home/HomeNav";
import FancySlider from "../components/home/Slider";
import  UserFlow  from "../components/home/UserFlow";

export default function HomePage() {
  return (
    <div className="relative w-full">
      <HomeNav></HomeNav>
      <Hero></Hero>
      <UserFlow></UserFlow>
      <FeaturesSectionDemo></FeaturesSectionDemo>
      <Footer></Footer>
       
    </div>
  );
}

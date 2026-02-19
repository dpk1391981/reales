import RealEstateHeader from "./component/Header";
import TopCities from "./component/TopCities";
import FeaturedProjects from "./component/FeaturedProjects";
import TopServices from "./component/TopServices";
import TopAgents from "./component/TopAgents";

export default function App() {
  return (
    <>
      <RealEstateHeader />
      <TopCities />
      <FeaturedProjects />
      <TopServices />
      <TopAgents />
    </>
  );
}

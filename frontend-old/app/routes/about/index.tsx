import { useEffect } from "react";
import { Button } from "~/components/ui/button";

const About = () => {
  useEffect(() => {
    document.title = "About";
  }, []);
  return <Button>Hello</Button>;
};

export default About;

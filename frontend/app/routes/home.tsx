import { useEffect, useState } from "react";

const Home = () => {
  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    document.title = "DTBox";
    setData(Array.from({ length: 100 }, (_, i) => i));
  }, []);

  return (
    <div>
      {data.map((item) => (
        <div key={item}>{item}</div>
      ))}
    </div>
  );
};

export default Home;

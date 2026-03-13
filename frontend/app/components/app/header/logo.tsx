import { useNavigate } from "react-router";

const Logo = () => {
  const navigate = useNavigate();
  return (
    <img
      onClick={() => navigate("/")}
      className="size-8"
      src="/favicon.ico"
      alt="Logo"
    />
  );
};

export default Logo;

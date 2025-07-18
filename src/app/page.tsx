import { redirect } from "next/navigation";

const Home = (): never => {
  redirect("/dashboard");
};

export default Home;

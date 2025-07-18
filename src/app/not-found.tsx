import { paths } from "@/utils/paths.utils";
import { redirect } from "next/navigation";

const NotFoundPage = () => {
  return redirect(paths.errors.notFound);
};

export default NotFoundPage;

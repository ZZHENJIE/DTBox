import { useEffect, useState } from "react";
import {
  EconomyFinviz as EconomyFinvizAPI,
  type EconomyFinvizItem,
} from "~/lib/API/Source/Calendar";
import DataTable from "./data-table";
import { columns } from "./columns";
import { Spinner } from "~/components/ui/spinner";

const EconomyFinviz = () => {
  const [data, setData] = useState<EconomyFinvizItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    EconomyFinvizAPI("2026-03-30", "2026-04-03").then((response) => {
      setData(response.data);
      setIsLoading(false);
    });
  }, []);
  return (
    <div className="flex justify-center">
      {isLoading ? (
        <Spinner className="size-8" />
      ) : (
        <DataTable columns={columns} data={data!} />
      )}
    </div>
  );
};

export default EconomyFinviz;

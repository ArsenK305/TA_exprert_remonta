import { useCallback, useEffect, useState } from "react";
// import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { AgGridReact } from "@ag-grid-community/react";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface DataRow {
  Month: string;
  Employee: string;
  EstimateCount: number;
  ContractCount: number;
  ConversionPercent: number;
}

const SqlQueryToolRemade = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/analytics");
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      if (error instanceof Error) {
        setError(`Failed to fetch analytics: ${error.message}`);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const columnDefs = [
      { headerName: "Месяц", field: "Month", sortable: true, filter: "agDateColumnFilter" },
      { headerName: "Сотрудник", field: "Employee", sortable: true, filter: "agTextColumnFilter" },
      { headerName: "Estimate", field: "EstimateCount", sortable: true, filter: "agNumberColumnFilter" },
      { headerName: "Contract", field: "ContractCount", sortable: true, filter: "agNumberColumnFilter" },
      { headerName: "Конверсия (%)", field: "ConversionPercent", sortable: true, filter: "agNumberColumnFilter" },
    ];


  return (
    <div className="ag-theme-alpine" style={{ height: "80vh", width: "100%" }}>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <AgGridReact
          rowData={data}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
        />
      )}
    </div>
  );
};

export default SqlQueryToolRemade;

import { useCallback, useState } from "react";
import { Database, QueryExecResult } from "sql.js";
import Editor from "@monaco-editor/react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

interface SqlQueryToolProps {
  db: Database;
}

function SqlQueryTool(props: SqlQueryToolProps) {
  const { db } = props;
  const [query, setQuery] = useState("SELECT * FROM documents");
  const [error, setError] = useState<string>("");
  const [results, setResults] = useState<QueryExecResult[]>([]);
  const [loading, setLoading] = useState(false);

  const executeQuery = useCallback(() => {
    setLoading(true);
    try {
      setResults(db.exec(query));
      setError("");
    } catch (error) {
      if (error instanceof Error) {
        setError(`An error occurred: ${error.message}`);
      } else if (typeof error === "string") {
        setError(error);
      } else {
        setError("An unknown error occurred");
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [db, query]);

  return (
    <div className="grid grid-cols-2 w-full gap-4">
      <div className="flex flex-col gap-4">
        <Typography variant="h5" gutterBottom>
          SQL Query
        </Typography>
        <div className="w-full mb-4">
          <Editor
            value={query}
            onChange={(text) => setQuery(text!)}
            width="100%"
            height="80vh"
            defaultLanguage="sql"
          />
        </div>
        {error && (
          <Typography variant="body2" color="error" className="text-red-600">
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={executeQuery}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Execute Query"}
        </Button>
      </div>

      <div className="mt-4">
        <Typography variant="h5" gutterBottom>
          Query Results
        </Typography>
        {results.length > 0 ? (
          <TableContainer component={Paper} sx={{ minHeight: 400 }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  {results[0].columns.map((col) => (
                    <TableCell key={col} align="left">
                      <strong>{col}</strong>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {results[0].values.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} align="left">
                        {cell !== null ? cell.toString() : "NULL"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No results to display.
          </Typography>
        )}
      </div>
    </div>
  );
}

export default SqlQueryTool;

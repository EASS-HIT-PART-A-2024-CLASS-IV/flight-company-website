import { FunctionComponent } from "react";
import { FlightFormData, FlightFromService } from "api/flight-service";
import "./FlightsTable.css";
import DataTable from "react-data-table-component";
import {
  Box,
  Card,
  Container,
  CssBaseline,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";

const columns = [
  {
    name: "Number",
    selector: (row: FlightFromService) => row.number,
  },
  {
    name: "Time",
    selector: (row: FlightFromService) => row.time,
  },
  {
    name: "Cost",
    selector: (row: FlightFromService) => row.cost + "$",
  },
  {
    name: "Left Seats",
    selector: (row: FlightFromService) =>
      row.seats.filter((seat) => seat.isLocked === false).length,
  },
];

interface FlightFormDataRowProps {
  flightFormData: FlightFromService[];
  date: string;
  source: string;
  destination: string;
  onClick: (flight: FlightFromService) => void;
}

const FlightFormDatasTable: FunctionComponent<FlightFormDataRowProps> = ({
  flightFormData,
  date,
  source,
  destination,
  onClick,
}) => {
  // format date
  date = new Date(date).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
  return (
    <ThemeProvider theme={createTheme()}>
      <Container
        component="main"
        maxWidth="xs"
        className="flight-row"
        style={{ paddingLeft: "0", paddingRight: "0px" }}
      >
        <CssBaseline />
        <Card variant="outlined" sx={{ my: 2 }}>
          <Box component="div" sx={{ my: 2 }}>
            <Typography
              component="p"
              style={{ marginLeft: "34px" }}
            >{`${source} -> ${destination}, ${date}`}</Typography>
            <DataTable
              columns={columns}
              data={flightFormData}
              noDataComponent={<>{"No flights found on this date"}</>}
              pagination
              highlightOnHover
              pointerOnHover
              selectableRows
              selectableRowsHighlight
              selectableRowsSingle
              onSelectedRowsChange={({ selectedRows }) => {
                onClick(selectedRows[0]);
              }}
              paginationComponentOptions={{
                noRowsPerPage: true,
              }}
              paginationPerPage={3}
            />
          </Box>
        </Card>
      </Container>
    </ThemeProvider>
  );
};

export default FlightFormDatasTable;

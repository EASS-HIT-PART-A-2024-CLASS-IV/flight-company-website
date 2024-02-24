import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  TextField,
  Typography,
  createTheme,
} from "@mui/material";

import { Country } from "api/contries-service";
import ServiceLocator from "api/service.locator";
import dayjs, { Dayjs } from "dayjs";
import { FunctionComponent, useEffect, useState } from "react";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ThemeProvider } from "styled-components";
import Swal from "sweetalert2";
import { FlightSearchFormData } from "api/flight-service";

interface SeachFlightProps {
  onSearch: (formData: FlightSearchFormData) => void;
}
const SeachFlight: FunctionComponent<SeachFlightProps> = ({ onSearch }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  useEffect(() => {
    ServiceLocator.countriesService
      .getCountriesList()
      .then((countries) => setCountries(countries));
  }, []);

  const validateDate = (date: Dayjs | null): boolean => {
    if (date == null) return false;
    return (
      dayjs(date).isSame(dayjs(), "day") || dayjs(date).isAfter(dayjs(), "day")
    );
  };

  const validateForm = (formData: Partial<FlightSearchFormData>): boolean => {
    if (!formData.source) {
      Swal.fire("error", "Please select a departure country.", "error");
      return false;
    }

    if (!formData.destination) {
      Swal.fire("error", "Please select a destination country.", "error");
      return false;
    }
    const checkIn: Dayjs = dayjs(formData.checkIn);
    if (!validateDate(checkIn)) {
      Swal.fire("error", "Invalid check-in date.", "error");
      return false;
    }

    const checkOut: Dayjs = dayjs(formData.checkOut);
    if (!validateDate(checkOut)) {
      Swal.fire("error", "Invalid check-out date.", "error");
      return false;
    }
    if (checkIn.isAfter(checkOut)) {
      Swal.fire(
        "error",
        "Check-out date must be after check-in date.",
        "error"
      );
      return false;
    }
    return true;
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const seatchTerms: Partial<FlightSearchFormData> = {
      checkIn: data.get("checkIn")?.toString(),
      checkOut: data.get("checkOut")?.toString(),
      source: data.get("source")?.toString(),
      destination: data.get("destination")?.toString(),
    };
    // validate seatchTerms
    if (validateForm(seatchTerms)) {
      const defaults: FlightSearchFormData = {
        source: "",
        destination: "",
        checkIn: "",
        checkOut: "",
      };
      onSearch({ ...defaults, ...seatchTerms });
    }
  };
  return (
    <ThemeProvider theme={createTheme()}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "#fd7e97" }}>
            <AirplanemodeActiveIcon />
          </Avatar>
          <Typography component="h1" variant="h5" className="prevent-select">
            Search Flight
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  disablePortal
                  id="source"
                  options={countries.map(({ name, code }) => ({
                    label: name,
                    key: code,
                  }))}
                  renderInput={(params) => (
                    <TextField name="source" {...params} label="Source" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  disablePortal
                  id="destination"
                  options={countries.map(({ name, code }) => ({
                    label: name,
                    key: code,
                  }))}
                  renderInput={(params) => (
                    <TextField
                      name="destination"
                      {...params}
                      label="Destination"
                    />
                  )}
                />
              </Grid>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    name="checkIn"
                    defaultValue={dayjs()}
                    label="Check in"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    name="checkOut"
                    defaultValue={dayjs()}
                    label="Check Out"
                  />
                </Grid>
              </LocalizationProvider>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Search Flight
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default SeachFlight;

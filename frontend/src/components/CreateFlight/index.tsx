import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  InputAdornment,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import { Country } from "api/contries-service";
import { FlightFormData } from "api/flight-service";
import ServiceLocator from "api/service.locator";
import dayjs, { Dayjs } from "dayjs";
import { FunctionComponent, useEffect, useState } from "react";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Swal from "sweetalert2";

interface CreateFlightProps {
  onCreate: (formData: FlightFormData) => void;
}

const CreateFlight: FunctionComponent<CreateFlightProps> = ({ onCreate }) => {
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
  const validateTime = (time: string | undefined): boolean => {
    if (time == null || time.length === 0) return false;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timeRegex.test(time);
  };

  const validateForm = (formData: Partial<FlightFormData>): boolean => {
    if (!formData.source) {
      Swal.fire("error", "Please select a departure country.", "error");
      return false;
    }

    if (!formData.destination) {
      Swal.fire("error", "Please select a destination country.", "error");
      return false;
    }
    const date: Dayjs = dayjs(formData.date);
    const time = formData.time;
    if (!validateDate(date) || !validateTime(time)) {
      Swal.fire("error", "Invalid flight date or time.", "error");
      return false;
    }
    if (
      formData.cost_per_seat === undefined ||
      formData.cost_per_seat > 0 === false
    ) {
      Swal.fire("error", "Please enter valid cost.", "error");
      return false;
    }
    return true;
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const createTerms: Partial<FlightFormData> = {
      number: data.get("number")?.toString(),
      source: data.get("source")?.toString(),
      date: data.get("date")?.toString(),
      time: data.get("time")?.toString(),
      destination: data.get("destination")?.toString(),
      cost_per_seat: parseInt(data.get("cost")?.toString() ?? "0"),
    };
    if (validateForm(createTerms)) {
      const defaults: FlightFormData = {
        cost_per_seat: 0,
        date: "",
        source: "",
        destination: "",
        number: "",
        time: "",
      };
      onCreate({ ...defaults, ...createTerms });
    }
  };
  return (
    <ThemeProvider theme={createTheme()}>
      <Container component="main" maxWidth="xs">
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
            Create Flight
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="flightnumber"
                  label="Flight Number"
                  name="number"
                  autoComplete="off"
                  autoFocus
                />
              </Grid>
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
                  <DatePicker name="date" defaultValue={dayjs()} label="Date" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TimePicker
                    label="time of flight"
                    name="time"
                    ampm={false}
                    defaultValue={dayjs()}
                  />
                </Grid>
              </LocalizationProvider>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="cost"
                  label="Cost Per Seat"
                  name="cost"
                  autoComplete="off"
                  type="number"
                  defaultValue={0}
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Create Flight
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default CreateFlight;

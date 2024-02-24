import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from "@mui/material";
import { ThemeProvider } from "styled-components";
import { createTheme } from "react-data-table-component";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

export interface PersonalInfo {
  id: string;
  dob: string;
  fullName: string;
}

interface PersonalInfoFormProps {
  onSetPersonalInfo: (personalInfo: PersonalInfo) => void;
  info?:PersonalInfo| null
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  onSetPersonalInfo,
  info
}) => {
  const [personalInfo, setPersonalInfo] = useState<any>(info ?? {});
  const handleInputChange = (event: any) => {
    const info = { ...personalInfo, [event.target.name]: event.target.value };
    setPersonalInfo(info);
    const data = validatePersonalInfo(info);
    if (data) {
      onSetPersonalInfo(data as PersonalInfo);
    }
  };
  const handleDOBChange = (date: Dayjs | null) => {
    if (date == null || date.isValid() === false) {
      setPersonalInfo({ ...personalInfo, dob: null });
      return;
    }
    const info = { ...personalInfo, dob: date.format("MM/DD/YYYY") };
    setPersonalInfo(info);
    const data = validatePersonalInfo(info);
    if (data) {
      onSetPersonalInfo(data as PersonalInfo);
    }
  };

  const validatePersonalInfo = (
    personalInfo: Partial<PersonalInfo>
  ): PersonalInfo | void => {
    if (!personalInfo.dob || !personalInfo.fullName || !personalInfo.id) return;
    return personalInfo as PersonalInfo;
  };
  return (
    <ThemeProvider theme={createTheme()}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5" className="prevent-select">
            Enter your personal details
          </Typography>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              name="id"
              label="ID"
              variant="outlined"
              defaultValue={personalInfo?.id}
              value={personalInfo?.id}
              onChange={handleInputChange}
              style={{ margin: "10px 0", width: "100%" }}
              required
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                sx={{ mt: 1 }}
                name="dob"
                value={personalInfo?.dob ? dayjs(personalInfo.dob) : null}
                label="Date of Birth"
                onChange={handleDOBChange}
              />
            </LocalizationProvider>

            <TextField
              name="fullName"
              label="Full Name"
              variant="outlined"
              value={personalInfo?.fullName}
              onChange={handleInputChange}
              style={{ margin: "10px 0", width: "100%" }}
              required
            />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default PersonalInfoForm;

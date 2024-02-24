import {
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { PersonalInfo } from "../PersonalInfoForm";
import ServiceLocator from "api/service.locator";

export interface CreditCard {
  number: string;
  expiry: string;
  name: string;
  cvc: string;
}

interface CreditCardFormProps {
  onSetCreditCard: (newCreditCard: CreditCard) => void;
  personalInfo: PersonalInfo;
  selectedFromSeat: string;
  selectedToSeat: string;
  amount:number,
  fromFlightNumber:string,
  toFlightNumber:string
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({
  onSetCreditCard,
  personalInfo,
  selectedFromSeat,
  selectedToSeat,
  amount,
  fromFlightNumber,
  toFlightNumber
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const card: Partial<CreditCard> = {
      name: data.get("name")?.toString(),
      number: data.get("cardnumber")?.toString(),
      expiry: data.get("expiry")?.toString(),
      cvc: data.get("cvc")?.toString(),
    };
    const newCard = validateCreditCard(card);
    if (newCard) {
      ServiceLocator.paymentService
        .pay({
          nameOnCard: newCard.name,
          cardNumber: newCard.number,
          expiry: newCard.expiry,
          cvc: newCard.cvc,
          fullName: personalInfo.fullName,
          id: personalInfo.id,
          dob: personalInfo.dob,
          selectedFromSeat: selectedFromSeat,
          selectedToSeat: selectedToSeat,
          amount:amount,
          fromFlightNumber,
          toFlightNumber
        })
        .then((res: boolean | undefined) => {
          if (!res) return;
          Swal.fire(
            "Success",
            "Payment successfully processed.",
            "success"
          ).then(() => {
            onSetCreditCard(newCard);
          });
        });
    }
  };
  const validateCreditCard = (
    partialCard: Partial<CreditCard>
  ): CreditCard | void => {
    const { name, number, expiry, cvc } = partialCard;

    if (!name || name.length === 0) {
      Swal.fire("error", "Please enter the name on the card.", "error");
      return;
    }
    //The expression covers various card types and formats including Visa, MasterCard, American Express, Discover, and others
    const cardNumberReg =
      /^(?:4[0-9]{12}(?:[0-9]{3})?|[25][1-7][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;
    if (
      !number ||
      number.length === 0 ||
      cardNumberReg.test(number) === false
    ) {
      Swal.fire("error", "Please enter the card number.", "error");
      return;
    }
    if (!expiry || expiry?.length === 0) {
      Swal.fire("error", "Please enter the expiry date.", "error");
      return;
    }
    if (!cvc || cvc.length === 0) {
      Swal.fire("error", "Please enter the CVC.", "error");
      return;
    }
    return {
      name: name as string,
      number: number as string,
      expiry: expiry as string,
      cvc: cvc as string,
    };
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
            Enter your payment details
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Grid>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Name on Card"
                name="name"
                autoComplete="name"
                autoFocus
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="cardnumber"
                label="Card Number"
                name="cardnumber"
                type="number"
                autoComplete="cc-number"
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  sx={{ mt: 1 }}
                  name="expiry"
                  format="MM/YY"
                  defaultValue={dayjs()}
                  label="Expiry"
                />
              </LocalizationProvider>
              <TextField
                margin="normal"
                required
                fullWidth
                id="cvc"
                label="CVC"
                name="cvc"
                type="number"
                autoComplete="cc-csc"
              />
              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
              >
                Make Payment
              </Button>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default CreditCardForm;

import React, { useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from "@mui/material";
import FlightDetails from "./FlightDetails";
import SeatSelection from "./SeatSelection";
import PersonalInfoForm, { PersonalInfo } from "./PersonalInfoForm";
import CreditCardForm, { CreditCard } from "./CreditCardForm";
import PurchaseComplete from "./PurchaseComplete";
import { FlightFromService } from "api/flight-service";
import { useNavigate } from "react-router-dom";

interface SeatBookingProps {
  fromFlightData: FlightFromService;
  toFlightData: FlightFromService;
}

const SeatBooking: React.FC<SeatBookingProps> = ({
  fromFlightData,
  toFlightData,
}) => {
  const [selectedFromSeat, setSelectedFromSeat] = useState<string | null>(null);
  const [selectedToSeat, setSelectedToSeat] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>();
  const [creditCardInfo, setCreditCardInfo] = useState<CreditCard | null>();
  const amount = fromFlightData.cost + toFlightData.cost;
  const navigate = useNavigate();
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSeatSelection = (seatNumber: string, isFromFlight: boolean) => {
    if (isFromFlight) {
      setSelectedFromSeat((prevSeat) =>
        prevSeat === seatNumber ? null : seatNumber
      );
    } else {
      setSelectedToSeat((prevSeat) =>
        prevSeat === seatNumber ? null : seatNumber
      );
    }
  };

  const steps = [
    "From Flight",
    "To Flight",
    "Personal Info",
    "Credit Card",
    "Purchase Complete",
  ];

  const components = [
    <FlightDetails flightData={fromFlightData} />,
    <FlightDetails flightData={toFlightData} />,
    <PersonalInfoForm
      info={personalInfo ? personalInfo : null}
      onSetPersonalInfo={(info: PersonalInfo) => setPersonalInfo(info)}
    />,
    <CreditCardForm
      personalInfo={personalInfo ?? ({} as any)}
      selectedFromSeat={selectedFromSeat ?? ""}
      selectedToSeat={selectedToSeat ?? ""}
      fromFlightNumber={fromFlightData.number}
      toFlightNumber={toFlightData.number}
      amount={amount}
      onSetCreditCard={(newCreditCard: CreditCard) => {
        setCreditCardInfo(newCreditCard);
        handleNext();
      }}
    />,
    <PurchaseComplete />,
  ];

  const isFromStep = activeStep === 0;
  const isToStep = activeStep === 1;

  return (
    <div style={{ padding: 20 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={3} style={{ marginTop: 20, padding: 20 }}>
        {components[activeStep]}
        {isFromStep && (
          <SeatSelection
            seats={fromFlightData.seats}
            selectedSeat={selectedFromSeat}
            onSeatSelection={(seatNumber) =>
              handleSeatSelection(seatNumber, true)
            }
          />
        )}
        {isToStep && (
          <SeatSelection
            seats={toFlightData.seats}
            selectedSeat={selectedToSeat}
            onSeatSelection={(seatNumber) =>
              handleSeatSelection(seatNumber, false)
            }
          />
        )}
      </Paper>

      <div style={{ marginTop: 20 }}>
        {activeStep !== 0 && (
          <Button
            variant="contained"
            onClick={() => {
              if (activeStep !== 4) {
                handleBack();
                return;
              }
              navigate("/home");
            }}
          >
            {activeStep !== 4 ? "Back" : "finish"}
          </Button>
        )}
        {activeStep < steps.length - 2 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && !selectedFromSeat) ||
              (activeStep === 1 && !selectedToSeat) ||
              (activeStep === 2 && !personalInfo)
            }
            style={{ marginLeft: "10px" }}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default SeatBooking;

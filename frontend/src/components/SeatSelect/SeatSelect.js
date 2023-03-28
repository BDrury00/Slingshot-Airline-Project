import { useState, useEffect } from "react";
import styled from "styled-components";

import Plane from "./Plane";
import Form from "./Form";

const SeatSelect = ({ selectedFlight, setReservationId }) => {
  const [selectedSeat, setSelectedSeat] = useState("");

  const handleSubmit = async (e, formData) => {
    e.preventDefault();
    // POST info to server
    const response = await fetch("/api/add-reservation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flight: selectedFlight,
        seat: selectedSeat,
        givenName: formData.firstName,
        surname: formData.lastName,
        email: formData.email,
      }),
    });

    if (!response.ok) {
      console.log("Error occurred while creating reservation");
      return;
    }

    const data = await response.json();
    const reservationId = data.data._id;

    // Save reservationId in local storage
    localStorage.setItem("reservationId", reservationId);
    setReservationId(reservationId);

    // Redirect to confirmation page
    window.location.href = `/confirmation/`;
  };

  return (
    <Wrapper>
      <h2>Select your seat and Provide your information!</h2>
      <>
        <FormWrapper>
          <Plane
            setSelectedSeat={setSelectedSeat}
            selectedFlight={selectedFlight}
          />
          <Form handleSubmit={handleSubmit} selectedSeat={selectedSeat} />
        </FormWrapper>
      </>
    </Wrapper>
  );
};

const FormWrapper = styled.div`
  display: flex;
  margin: 50px 0px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
`;

export default SeatSelect;

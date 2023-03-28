import styled from "styled-components";
import { useState, useEffect } from "react";

import tombstone from "../assets/tombstone.png";

const Confirmation = () => {
  const reservationId = localStorage.getItem("reservationId");
  const [yourReservation, setYourReservation] = useState(null);

  useEffect(() => {
    fetch(`/api/get-reservation/${reservationId}`)
      .then((res) => res.json())
      .then((data) => {
        setYourReservation(data.reservationById);
        console.log(data.reservationById);
      })
      .catch((error) => console.log(error));
  }, []);

  console.log("yourReservation", yourReservation);

  return (
    <Wrapper>
      <h2>Reservation Details</h2>
      <p>Reservation ID: {yourReservation._id}</p>
      <p>Flight #: {yourReservation.flight}</p>
      <p>Seat #: {yourReservation.seat}</p>
      <p>First Name: {yourReservation.givenName}</p>
      <p>Last Name: {yourReservation.surname}</p>
      <p>Email: {yourReservation.email}</p>
    </Wrapper>
  );
};

const Wrapper = styled.div``;

export default Confirmation;

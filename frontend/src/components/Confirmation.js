import styled from "styled-components";
import { useState, useEffect } from "react";

const Confirmation = () => {
  const [yourReservation, setYourReservation] = useState(null);

  useEffect(() => {
    const reservationId = localStorage.getItem("reservationId");
    console.log(reservationId);
    fetch(`/api/get-reservation/${reservationId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setYourReservation(data.reservationById);

        console.log(data.reservationById);
      })
      .catch((error) => console.log(error));
  }, []);
  if (!yourReservation) {
    return <div>Loading...</div>;
  }

  return (
    <Wrapper>
      <h2>Your flight is confirmed!</h2>
      <p>
        <span>Reservation ID:</span> {yourReservation._id}
      </p>
      <p>
        <span>Flight #:</span> {yourReservation.flight}
      </p>
      <p>
        <span>Seat #:</span> {yourReservation.seat}
      </p>
      <p>
        <span>First Name:</span> {yourReservation.givenName}
      </p>
      <p>
        <span>Last Name:</span> {yourReservation.surname}
      </p>
      <p>
        <span>Email:</span> {yourReservation.email}
      </p>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  border: 2px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 0 5px #ccc;
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
  margin-top: 10%;
  margin-bottom: 15px;

  h2 {
    margin-top: 0;
    font-size: 24px;
    font-weight: bold;
    color: var(--color-alabama-crimson);
  }

  p {
    margin: 10px 0;
    font-size: 18px;
    line-height: 1.5;
  }

  span {
    font-weight: bold;
  }
`;

export default Confirmation;

import styled from "styled-components";
import { useEffect, useState } from "react";
import tombstone from "../assets/tombstone.png";

const Reservation = () => {
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
      <h1>Reservation(s)</h1>
      <ReservationCard key={yourReservation._id}>
        <div>
          <h2>
            {yourReservation.givenName} {yourReservation.surname}
          </h2>
          <p>{yourReservation.email}</p>
        </div>
        <div>
          <p>
            Flight: {yourReservation.flight} - Seat: {yourReservation.seat}
          </p>
        </div>
      </ReservationCard>
      )
      <img src={tombstone} alt="No reservations found" />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  img {
    width: 600px;
    justify-content: center;
    align-items: center;
    margin-left: 40%;
  }
`;

const ReservationCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid black;
  margin-bottom: 10px;
  background-color: lightgreen;
`;

export default Reservation;

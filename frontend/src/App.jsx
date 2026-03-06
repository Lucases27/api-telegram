import { useState } from "react";
import Dashboard from "./components/Dashboard";
import ReservationForm from "./components/ReservationForm";
import ReservationsTable from "./components/ReservationsTable";

function App() {
  const [reloadFlag, setReloadFlag] = useState(0);
  const [editReservation, setEditReservation] = useState(null);

  const reloadData = () => setReloadFlag(prev => prev + 1);
  const cancelEdit = () => setEditReservation(null);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Sistema de Reservas</h1>

      <Dashboard reloadFlag={reloadFlag} />

      <hr style={{ margin: "2rem 0" }} />

      <ReservationForm
        reload={reloadData}
        editReservation={editReservation}
        cancelEdit={cancelEdit}
      />

      <hr style={{ margin: "2rem 0" }} />

      <ReservationsTable
        reload={reloadData}
        onEdit={setEditReservation}
        key={reloadFlag}
      />
    </div>
  );
}

export default App;
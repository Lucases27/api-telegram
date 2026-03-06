import { useEffect, useState } from "react";
import { createReservation, getRestaurants, updateReservation } from "../services/api";

export default function ReservationForm({ reload, editReservation, cancelEdit }) {
  const [restaurants, setRestaurants] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [id, setId] = useState(null); // para editar

  useEffect(() => {
    getRestaurants().then(setRestaurants);
  }, []);

  // Si recibimos una reserva para editar, cargamos los valores
  useEffect(() => {
    if (editReservation) {
      setId(editReservation.id);
      setName(editReservation.name);
      setDate(editReservation.date);
      setRestaurantId(editReservation.restaurantId);
    }
  }, [editReservation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantId || !name || !date) return alert("Completa todos los campos");

    const payload = { restaurantId: Number(restaurantId), name, date };

    if (id) {
      await updateReservation(id, payload);
      alert("Reserva actualizada!");
    } else {
      await createReservation(payload);
      alert("Reserva creada!");
    }

    // reset form
    setId(null);
    setName("");
    setDate("");
    setRestaurantId("");

    reload();
    if (cancelEdit) cancelEdit(); // cerrar modo edición si aplica
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
      <h3>{id ? "Editar Reserva" : "Nueva Reserva"}</h3>

      <input
        placeholder="Nombre del cliente"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={{ marginRight: "1rem" }}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        style={{ marginRight: "1rem" }}
      />

      <select
        value={restaurantId}
        onChange={(e) => setRestaurantId(e.target.value)}
        required
        style={{ marginRight: "1rem" }}
      >
        <option value="">Seleccione restaurante</option>
        {restaurants.map(r => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>

      <button type="submit">{id ? "Actualizar" : "Crear"}</button>
      {id && (
        <button type="button" onClick={() => {
          setId(null); setName(""); setDate(""); setRestaurantId(""); cancelEdit();
        }} style={{ marginLeft: "1rem" }}>
          Cancelar
        </button>
      )}
    </form>
  );
}
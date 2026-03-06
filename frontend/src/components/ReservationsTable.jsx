import { useEffect, useState } from "react";
import { getReservations, deleteReservation } from "../services/api";

export default function ReservationsTable({ reload, onEdit }) {
  const [reservations, setReservations] = useState([]);

  // NUEVO: estados para filtros
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const loadReservations = async () => {
    const params = {};
    if (search) params.search = search;
    if (filterDate) params.date = filterDate;
    const data = await getReservations(params);
    setReservations(data);
  };

  // Carga inicial
  useEffect(() => {
    loadReservations();
  }, []);

  // Refrescar por orden del padre (reload), pero no al teclear (solo botón)
  useEffect(() => {
    loadReservations();
  }, [reload]);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta reserva?")) return;
    await deleteReservation(id);
    reload();
    loadReservations();
  };

  return (
    <>
      {/* NUEVO: Controles de Filtro */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          placeholder="Buscar por cliente"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: "1rem" }}
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{ marginRight: "1rem" }}
        />
        <button type="button" onClick={loadReservations}>Aplicar filtros</button>
        <button
          type="button"
          onClick={() => { setSearch(''); setFilterDate(''); loadReservations(); }}
          style={{ marginLeft: "0.5rem" }}
        >
          Limpiar
        </button>
      </div>

      {reservations.length === 0 ? (
        <p>No hay reservas registradas.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Restaurante</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(r => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.restaurantName}</td>
                <td>{r.date}</td>
                <td>
                  <button onClick={() => onEdit(r)}>Editar</button>
                  <button onClick={() => handleDelete(r.id)} style={{ marginLeft: "0.5rem" }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
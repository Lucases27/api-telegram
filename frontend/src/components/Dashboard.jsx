import { useEffect, useState } from "react";
import { getReservations } from "../services/api";

export default function Dashboard({ reloadFlag }) {
  const [summary, setSummary] = useState({
    total: 0,
    today: 0,
    byRestaurant: {},
  });

  const loadReservations = async () => {
    try {
      const data = await getReservations();

      const total = data.length;

      const todayDate = new Date().toISOString().split("T")[0];
      const today = data.filter(r => r.date === todayDate).length;

      const byRestaurant = {};
      data.forEach(r => {
        if (!byRestaurant[r.restaurantName]) byRestaurant[r.restaurantName] = 0;
        byRestaurant[r.restaurantName]++;
      });

      setSummary({ total, today, byRestaurant });
    } catch (err) {
      console.error("Error cargando reservas:", err);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [reloadFlag]);

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "2rem" }}>
      <h2>Dashboard</h2>

      <p><strong>Total de reservas:</strong> {summary.total}</p>
      <p><strong>Reservas de hoy:</strong> {summary.today}</p>

      <div>
        <h3>Reservas por restaurante:</h3>
        {Object.keys(summary.byRestaurant).length === 0 ? (
          <p>No hay reservas aún</p>
        ) : (
          <ul>
            {Object.entries(summary.byRestaurant).map(([name, count]) => (
              <li key={name}>{name}: {count}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
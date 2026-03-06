const API_URL = "http://localhost:3000";

export const getRestaurants = async () => {
  const res = await fetch(`${API_URL}/restaurants`);
  return res.json();
};

export const getReservations = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/reservations${query ? `?${query}` : ''}`);
  return res.json();
};

export const createReservation = async (reservation) => {
  const res = await fetch(`${API_URL}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reservation),
  });
  return res.json();
};

export const deleteReservation = async (id) => {
  const res = await fetch(`${API_URL}/reservations/${id}`, {
    method: "DELETE",
  });
  return res.json();
};

// ✅ Nueva función para actualizar reserva
export const updateReservation = async (id, reservation) => {
  const res = await fetch(`${API_URL}/reservations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reservation),
  });
  return res.json();
};
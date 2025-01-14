const API_URL = "http://localhost:5000/api/payments";

export const createPayment = async (paymentData) => {
  const response = await fetch(`${API_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(paymentData),
  });
  return response.json();
};

export const verifyPayment = async (transactionId) => {
  const response = await fetch(`${API_URL}/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transactionId }),
  });
  return response.json();
};

export const getFinancialInstitutions = async () => {
  try {
    const response = await fetch(`${API_URL}/pse/financial-institutions`);
    return response.json();
  } catch (error) {
    console.error("Error obteniendo instituciones financieras:", error);
    throw error;
  }
};

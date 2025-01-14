import React from "react";
import PaymentForm from "./components/PaymentForm";

function App() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Pasarela de pago con Wompi
      </h1>
      <PaymentForm />
    </div>
  );
}

export default App;

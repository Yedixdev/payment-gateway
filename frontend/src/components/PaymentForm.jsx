import React, { useState, useEffect } from "react";
import { createPayment, getFinancialInstitutions } from "../services/paymentService";
import { toast } from "react-toastify";

const PAYMENT_METHODS = {
  CARD: {
    name: "Tarjeta de Crédito/Débito",
    icon: "💳",
    fields: ["number", "cvc", "exp_month", "exp_year", "installments"],
  },
  NEQUI: {
    name: "Nequi",
    icon: "📱",
    fields: ["phone_number"],
  },
  PSE: {
    name: "PSE",
    icon: "🏦",
    fields: ["bank", "document_type", "document_number"],
  },
  BANCOLOMBIA_TRANSFER: {
    name: "Transferencia Bancolombia",
    icon: "🏧",
    fields: [],
  },
  BANCOLOMBIA_COLLECT: {
    name: "Pago en Corresponsal Bancolombia",
    icon: "💰",
    fields: [],
  },
  DAVIPLATA: {
    name: "Daviplata",
    icon: "📲",
    fields: ["phone_number"],
  },
};

const PaymentForm = () => {
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("COP");
  const [transactionResponse, setTransactionResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accept, setAccept] = useState(false);
  const [accept2, setAccept2] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("CARD");
  const [paymentDetails, setPaymentDetails] = useState({
    card_number: "",
    cvc: "",
    exp_month: "",
    exp_year: "",
    installments: 1,
    phone_number: "",
    bank: "",
    document_type: "CC",
    document_number: "",
  });
  const [banks, setBanks] = useState([]);
  const [customerData, setCustomerData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
  });

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const response = await getFinancialInstitutions();
        setBanks(response.data);
      } catch (error) {
        toast.error("Error cargando bancos");
      }
    };

    if (selectedMethod === "PSE") {
      loadBanks();
    }
  }, [selectedMethod]);

  const handlePaymentMethodChange = (method) => {
    setSelectedMethod(method);
    setPaymentDetails({}); // Resetear detalles al cambiar método
  };

  const handlePaymentDetailChange = (field, value) => {
    setPaymentDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accept || !accept2) {
      toast.error("Debes aceptar los términos y condiciones");
      return;
    }

    setLoading(true);

    try {
      const paymentData = {
        amount,
        currency,
        payment_method_type: selectedMethod,
        payment_method: {
          type: selectedMethod,
          ...getPaymentMethodData(),
        },
        acceptance_token: "eyJhbGciOiJIUzI1NiJ9...",
        accept_personal_auth: "eyJhbGciOiJIUzI1NiJ9...",
      };

      const response = await createPayment(paymentData);
      if (response.status === 201) {
        setTransactionResponse(response);
        toast.success("Pago realizado con éxito");
      } else {
        toast.error("Error al procesar el pago");
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      toast.error("Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodData = () => {
    switch (selectedMethod) {
      case "CARD":
        return {
          number: paymentDetails.card_number,
          cvc: paymentDetails.cvc,
          exp_month: paymentDetails.exp_month,
          exp_year: paymentDetails.exp_year,
          installments: paymentDetails.installments,
        };
      case "NEQUI":
      case "DAVIPLATA":
        return {
          phone_number: paymentDetails.phone_number,
        };
      case "PSE":
        return {
          type: "PSE",
          user_type: 0, // Por defecto persona natural
          user_legal_id_type: paymentDetails.document_type,
          user_legal_id: paymentDetails.document_number,
          financial_institution_code: paymentDetails.bank,
          payment_description: `Pago ref: ${Date.now()}`,
        };
      default:
        return {};
    }
  };

  const handleAccept = () => {
    setAccept(!accept);
  };

  const handleAccept2 = () => {
    setAccept2(!accept2);
  };

  return (
    <div className="mt-10 flex flex-row gap-10 bg-white rounded-lg shadow-lg p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Formulario de Pago
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Monto a pagar
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{currency}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Moneda
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="COP">Peso Colombiano (COP)</option>
              <option value="USD">Dólar Estadounidense (USD)</option>
            </select>
          </div>

          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-medium text-gray-900">
              Términos y Condiciones
            </h3>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="accept1"
                  checked={accept}
                  onChange={handleAccept}
                  className="mt-1"
                />
                <div>
                  <label
                    htmlFor="accept1"
                    className="block text-sm text-gray-700"
                  >
                    Acepto haber leído los{" "}
                    <span className="font-bold">reglamentos</span> y la{" "}
                    <span className="font-bold">política de privacidad</span>{" "}
                    para hacer este pago
                  </label>
                  <a
                    href="https://wompi.com/assets/downloadble/reglamento-Usuarios-Colombia.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Ver documento →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="accept2"
                  checked={accept2}
                  onChange={handleAccept2}
                  className="mt-1"
                />
                <div>
                  <label
                    htmlFor="accept2"
                    className="block text-sm text-gray-700"
                  >
                    Acepto la <span className="font-bold">autorización</span>{" "}
                    para la <span className="font-bold">administración</span> de
                    datos personales
                  </label>
                  <a
                    href="https://wompi.com/assets/downloadble/autorizacion-administracion-datos-personales.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Ver documento →
                  </a>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Procesando...
              </span>
            ) : (
              "Pagar ahora"
            )}
          </button>
        </form>

        {transactionResponse && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Respuesta de la transacción:
            </h3>
            <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
              {JSON.stringify(transactionResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-medium text-gray-900">Método de Pago</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(PAYMENT_METHODS).map(([key, method]) => (
            <button
              key={key}
              type="button"
              onClick={() => handlePaymentMethodChange(key)}
              className={`p-4 border rounded-lg flex items-center gap-2 ${
                selectedMethod === key
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl">{method.icon}</span>
              <span className="text-sm font-medium">{method.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-4">
          {selectedMethod === "CARD" && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Número de tarjeta"
                value={paymentDetails.card_number}
                onChange={(e) =>
                  handlePaymentDetailChange("card_number", e.target.value)
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {/* ... otros campos de tarjeta ... */}
            </div>
          )}

          {(selectedMethod === "NEQUI" || selectedMethod === "DAVIPLATA") && (
            <input
              type="tel"
              placeholder="Número de celular"
              value={paymentDetails.phone_number}
              onChange={(e) =>
                handlePaymentDetailChange("phone_number", e.target.value)
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          )}

          {selectedMethod === "PSE" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Banco
                </label>
                <select
                  value={paymentDetails.bank}
                  onChange={(e) => handlePaymentDetailChange("bank", e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Seleccione un banco</option>
                  {banks.map((bank, index) => (
                    <option key={index} value={bank.financial_institution_code}>
                      {bank.financial_institution_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de documento
                </label>
                <select
                  value={paymentDetails.document_type}
                  onChange={(e) => handlePaymentDetailChange("document_type", e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                >
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="NIT">NIT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Número de documento
                </label>
                <input
                  type="text"
                  value={paymentDetails.document_number}
                  onChange={(e) => handlePaymentDetailChange("document_number", e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                  placeholder="Ingrese su número de documento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={customerData.full_name}
                  onChange={(e) => setCustomerData(prev => ({...prev, full_name: e.target.value}))}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                  placeholder="Nombres y apellidos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData(prev => ({...prev, email: e.target.value}))}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={customerData.phone_number}
                  onChange={(e) => setCustomerData(prev => ({...prev, phone_number: e.target.value}))}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                  placeholder="Número de teléfono"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;

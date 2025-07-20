import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { FaTrashCan } from "react-icons/fa6";

export default function Cart() {
  const location = useLocation();
  const cart = location.state?.cart || [];
  const [loading, setLoading] = useState(false);


  //   const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);

    // Load Stripe using your publishable key
    const stripe = await loadStripe(
      import.meta.env.VITE_STRIPE_PK
    );

    try {
      const response = await fetch(
        "http://localhost:8080/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: cart }),
        }
      );

      const data = await response.json();

      const result = await stripe.redirectToCheckout({
        sessionId: data.id,
      });

      if (result.error) {
        console.error("Stripe checkout error:", result.error.message);
        alert("Checkout failed: " + result.error.message);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const [cartState, setCartState] = useState(cart);

  useEffect(() => {
    setCartState(cart);
  }, [cart]);

  const handleQuantityChange = (index, delta) => {
    setCartState((prevCart) =>
      prevCart.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const [totalState, setTotalState] = useState(
    cartState.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  useEffect(() => {
    setTotalState(
      cartState.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );
  }, [cartState]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
            <button className="text-3xl font-bold mb-6 bg-red-500 text-white px-3 py-1 rounded"
            onClick={() => navigate("/")}>
                Back
            </button>
        </div>
      
      {cartState.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="bg-white rounded shadow-md p-6">
          <ul>
            {cartState.map((item, index) => (
              <li key={index} className="flex mb-4 border-b pb-2">
                <div>
                  <div className="text-xl font-semibold">{item.name}</div>
                  <div className="text-gray-600">
                    ${(item.price / 100).toFixed(2)}
                  </div>
                  <div className="flex text-sm font-semibold space-x-2 items-center">
                    <span>Quantity: </span>
                    <button
                      onClick={() => handleQuantityChange(index, -1)}
                      className="shadow pl-1 pr-1"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <div>{item.quantity}</div>
                    <button
                      onClick={() => handleQuantityChange(index, 1)}
                      className="shadow pl-1 pr-1"
                    >
                      +
                    </button>
                  </div>
                  <button className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded transition-colors"
                  onClick={() => {
                    setCartState((prevCart) =>
                      prevCart.filter((_, i) => i !== index)
                    )}}>
                    <FaTrashCan />
                  </button>
                </div>
                <div className="ml-auto flex flex-col items-center">
                  {/* Product Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-40 h-28 object-cover rounded-md mb-4 border-2 border-blue-200 shadow"
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-lg font-bold">
            Total: ${(totalState / 100).toFixed(2)}
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {loading ? "Processing..." : "Proceed to Checkout"}
          </button>
        </div>
      )}
    </div>
  );
}

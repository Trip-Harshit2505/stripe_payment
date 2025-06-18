import React from 'react'
import { FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Products() {

    const mockProducts = [
        {
          id: 1,
          name: "Cup",
          image: "cup.jpg",
          price: 100,
          description: "This is product 1",
        },
        {
          id: 2,
          name: "Running Shoes",
          image: "running_shoes.jpg",
          price: 200,
          description: "This is product 2",
        },
        {
          id: 3,
          name: "T-Shirt",
          image: "tshirt.jpg",
          price: 300,
          description: "This is product 3",
        },
        {
          id: 4,
          name: "Casual Wear",
          image: "casual.jpg",
          price: 400,
          description: "This is product 4",
        },
        {
          id: 5,
          name: "Watch",
          image: "watch.jpg",
          price: 500,
          description: "This is product 5",
        },
      ];

    const navigate = useNavigate();

    const [cart, setCart] = React.useState([]);
    const checkOutOptions = () => {
      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      navigate('/cart', {state: { cart }});
    };

return (
        <div className="container flex flex-col items-center min-h-screen bg-gray-100 py-10 relative">
            {/* Cart Icon at Top Right */}
            <div className="absolute top-6 right-10">
                <div className="relative">
                    <FaShoppingCart className="text-3xl text-blue-600 cursor-pointer" onClick={checkOutOptions}/>
                    {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            {cart.reduce((total, item) => total + item.quantity, 0)}
                        </span>
                    )}
                </div>
            </div>
            <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                {mockProducts.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center transition-transform hover:scale-105"
                    >
                        {/* Product Image */}
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-40 h-28 object-cover rounded-md mb-4 border-2 border-blue-200 shadow"
                        />
                        <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
                        <p className="text-lg text-gray-700 mb-1">${(product.price / 100).toFixed(2)}</p>
                        <button
                            className="mt-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
                            onClick={() => {
                                const existingProduct = cart.find(item => item.id === product.id);
                                if (existingProduct) {
                                    setCart(cart.map(item => 
                                        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                                    ));
                                } else {
                                    setCart([...cart, { ...product, quantity: 1 }]);
                                }
                            }}
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>                       
        </div>
    );
}

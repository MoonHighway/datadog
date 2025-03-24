import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { datadogRum } from "@datadog/browser-rum";
import axios from "axios";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/products/${id}`
        );
        setProduct(response.data);

        // Datadog RUM custom action - product viewed
        datadogRum.addAction("product_viewed", {
          product_id: response.data.id,
          product_name: response.data.name,
          product_price: response.data.price,
          category: response.data.category
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Unknown error";
        setError(errorMessage);

        // Datadog RUM error tracking
        datadogRum.addError(err, {
          product_id: id,
          location: "ProductDetail"
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    // Add to cart logic
    if (product) {
      // Datadog RUM custom action - add to cart
      datadogRum.addAction("add_to_cart", {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: 1,
        total: product.price
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error)
    return <div>Error loading product: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="product-detail">
      <img src={product.imageUrl} alt={product.name} />
      <h1>{product.name}</h1>
      <p className="price">${product.price.toFixed(2)}</p>
      <p className="description">{product.description}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
};

export default ProductDetail;

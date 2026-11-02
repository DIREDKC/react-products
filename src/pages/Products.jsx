import { useEffect, useState } from "react";
import ProductList from "../components/ProductList";
import {
  getProducts,
  deleteProduct,
  searchProducts,
  getCategories,
  getProductsByCategory,
  createProduct,
  updateProduct,
} from "../services/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;
  const [newProduct, setNewProduct] = useState({
  title: "",
  price: "",
  category: "",
    });
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
  loadProducts();
  loadCategories();
}, []);

async function loadProducts(currentPage = 1) {
  try {
    setLoading(true);
    setError("");

    const skip = (currentPage - 1) * limit;

    const data = await getProducts(limit, skip);

    setProducts(data.products);
    setTotal(data.total);
    setPage(currentPage);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}

function handlePreviousPage() {
  if (page > 1) {
    loadProducts(page - 1);
  }
}

function handleNextPage() {
  if (page * limit < total) {
    loadProducts(page + 1);
  }
}


  async function loadCategories() {
  try {
    const data = await getCategories();
    setCategories(data);
  } catch (error) {
    setError(error.message);
  }
}

async function loadCategories() {
  try {
    const data = await getCategories();
    setCategories(data);
  } catch (error) {
    setError(error.message);
  }
}

  async function handleDelete(id) {
    try {
      await deleteProduct(id);

      setProducts(
        products.filter((product) => product.id !== id)
      );
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleSearch(event) {
  event.preventDefault();

  try {
    setLoading(true);
    setError("");

    const data = await searchProducts(query);
    setProducts(data.products);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}

async function handleCategory(event) {
  const category = event.target.value;

  try {
    setLoading(true);
    setError("");

    if (category === "") {
      const data = await getProducts();
      setProducts(data.products);
    } else {
      const data = await getProductsByCategory(category);
      setProducts(data.products);
    }
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}

function handleNewProductChange(event) {
  setNewProduct({
    ...newProduct,
    [event.target.name]: event.target.value,
  });
}

async function handleCreate(event) {
  event.preventDefault();

  try {
    const createdProduct = await createProduct(newProduct);

    setProducts([
      createdProduct,
      ...products,
    ]);

    setNewProduct({
      title: "",
      price: "",
      category: "",
    });
  } catch (error) {
    setError(error.message);
  }
}

  function handleEdit(product) {
  setEditingProduct(product);

  setNewProduct({
    title: product.title,
    price: product.price,
    category: product.category,
  });
}

async function handleUpdate(event) {
  event.preventDefault();

  try {
    const updatedProduct = await updateProduct(
      editingProduct.id,
      newProduct
    );

    setProducts(
      products.map((product) =>
        product.id === editingProduct.id
          ? updatedProduct
          : product
      )
    );

    setEditingProduct(null);

    setNewProduct({
      title: "",
      price: "",
      category: "",
    });
  } catch (error) {
    setError(error.message);
  }
}

  if (loading) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section>
      <h1>Productos</h1>

<form onSubmit={handleSearch}>
  <input
    type="text"
    value={query}
    onChange={(event) => setQuery(event.target.value)}
    placeholder="Buscar productos"
  />

  <button type="submit">
    Buscar
  </button>
</form>

<select onChange={handleCategory}>
  <option value="">Todas las categorías</option>

  {categories.map((category) => (
    <option
      key={category.slug}
      value={category.slug}
    >
      {category.name}
    </option>
  ))}
</select>

<form onSubmit={editingProduct ? handleUpdate : handleCreate}>
  <input
    type="text"
    name="title"
    placeholder="Título"
    value={newProduct.title}
    onChange={handleNewProductChange}
  />

  <input
    type="number"
    name="price"
    placeholder="Precio"
    value={newProduct.price}
    onChange={handleNewProductChange}
  />

  <input
    type="text"
    name="category"
    placeholder="Categoría"
    value={newProduct.category}
    onChange={handleNewProductChange}
  />

  <button type="submit">
  {editingProduct ? "Actualizar producto" : "Crear producto"}
</button>
</form>

      <ProductList
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <div className="pagination">
  <button
    onClick={handlePreviousPage}
    disabled={page === 1}
  >
    Anterior
  </button>

  <span>Página {page}</span>

  <button
    onClick={handleNextPage}
    disabled={page * limit >= total}
  >
    Siguiente
  </button>
</div>
    </section>
  );
}

export default Products;

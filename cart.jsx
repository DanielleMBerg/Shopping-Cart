const { useState, useEffect } = React;

const cartCompareFn = function(a, b) {
  let x = a.product.toLowerCase();
  let y = b.product.toLowerCase();
  if (x < y) {return -1;}
  if (x > y) {return 1;}
  return 0;
}

const photos = ['./images/apple.png', './images/orange.png', './images/beans.png', './images/cabbage.png'];
const products = [
  { id: 1, attributes: {Name: 'Apples', Country: 'Italy', Cost: 3, InStock: 10 }},
  { id: 2, attributes: {Name: 'Oranges', Country: 'Spain', Cost: 4, InStock: 3 }},
  { id: 3, attributes: {Name: 'Beans', Country: 'USA', Cost: 2, InStock: 5 }},
  { id: 4, attributes: {Name: 'Cabbage', Country: 'USA', Cost: 1, InStock: 8 }},
];

const Products = () => {
  const {Button} = ReactBootstrap;
  const [items, setItems] = useState(products);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  const addToCart = (e) => {
// If product is already in cart, update quantity, and update total cost of cart
    if (cart.find((item) => (item.product === e.target.name))) {
      let selectedProduct = cart.filter((item) => item.product === e.target.name);
      let cartItems = [{id: selectedProduct[0].id, product: e.target.name, cost: selectedProduct[0].cost, quantity: selectedProduct[0].quantity + 1}];
      let updatedCart = cart.filter((item) => item.product != e.target.name)
      setCart([...updatedCart, ...cartItems]);
      setTotal(total + selectedProduct[0].cost)
// If product is not already in cart, add item, and update total cost of cart
    } else {
      let selectedProduct = items.filter((item) => item.attributes.Name === e.target.name);
      let cartItem = [{id: selectedProduct[0].id, product: e.target.name, cost: selectedProduct[0].attributes.Cost, quantity: 1}];
      setCart([...cart, ...cartItem]);
      setTotal(total + selectedProduct[0].attributes.Cost)
    }
  }
  
  const reduceStock = (e) => {
      let selectedProduct = items.filter((item) => item.attributes.Name === e.target.name);
      selectedProduct = selectedProduct.pop();
      selectedProduct.attributes.InStock = selectedProduct.attributes.InStock - 1;
      let shadowItems = items;
      shadowItems.splice(selectedProduct.id-1, 1, selectedProduct)
      setItems(shadowItems);
  }

  const updateCart = (e) => {
    if (items.find((item) => (item.attributes.Name === e.target.name && item.attributes.InStock >= 1))){
      addToCart(e);
      reduceStock(e);
    } else {
      alert('Product selected is no longer available.')
    }
  };

  const addBackToStock = (e) => {
    let selectedProduct = items.filter((item) => item.attributes.Name === e.target.value);
    selectedProduct = selectedProduct.pop();
    selectedProduct.attributes.InStock = selectedProduct.attributes.InStock + 1;
    console.log(selectedProduct.attributes.InStock);
    let shadowItems = items;
    shadowItems.splice(selectedProduct.id-1, 1, selectedProduct)
    setItems(shadowItems);
  }

  const deleteCartItem = (e) => {
    if (confirm("Are you sure you want to remove this product from your cart?")) {
      let productToRemove = cart.find((item) => item.product === e.target.value);
      if (productToRemove.quantity > 1) {
        let newCart = cart.filter((item) => item.product != e.target.value);
        productToRemove.quantity = productToRemove.quantity - 1;
        newCart.push(productToRemove);
        setCart(newCart);  
      } else {
        let newCart = cart.filter((item) => item.product != e.target.value);
        setCart(newCart);
      }
      addBackToStock(e)
      setTotal(total - productToRemove.cost)
    } else {
      return;
    }
  };
  

  let productList = items.map((item, index) => { 
    return (
      <div className="card border-dark mb-3" key={index}>
        <img className="card-img-top" src={photos[index % 4]} alt="Fruit" />
        <div className="card-body">
          <h5 className="card-title">{item.attributes.Name}</h5>
          <p className="card-text">Cost: ${item.attributes.Cost}<br></br>{item.attributes.InStock} available</p>
          <Button name={item.attributes.Name} type="submit" onClick={updateCart}>Add to Cart</Button>
        </div>
      </div>
    );
  });

  let cartList = [...cart].sort(cartCompareFn).map((item) => {
    return (
      <>
      <li>﹡{item.product} (x {item.quantity}) <button 
        value={item.product} type="button" className="btn btn-danger btn-sm" onClick={deleteCartItem}>X</button></li>
      </>
    );
  });

  const getProducts = () => {
    const requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
  
    fetch("http://localhost:1337/api/products", requestOptions)
      .then(response => response.text())
      .then(result => {
        let json = JSON.parse(result);
        let data = json.data;
            data[0].attributes.InStock = items[0].attributes.InStock + data[0].attributes.InStock;
            data[1].attributes.InStock = items[1].attributes.InStock + data[1].attributes.InStock;
            data[2].attributes.InStock = items[2].attributes.InStock + data[2].attributes.InStock;
            data[3].attributes.InStock = items[3].attributes.InStock + data[3].attributes.InStock;
            setItems(data);
      })
      .catch(error => console.log('error', error));
  }

  const restockProducts = (e) => {
    e.preventDefault();
    getProducts();
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light justify-content-between">
        <button type="button" className="btn btn-info" onClick={restockProducts}>ReStock</button>
        <h3 className="navbar-brand" >React Shopping Cart</h3>
        <button className="btn btn-outline-dark my-2 my-sm-0" type="submit"
          > 🛒 Cart  <span className="badge bg-primary text-white ms-1 rounded-pill">${total}</span>
        </button>
      </nav>
      <h2>Product List</h2>
      <div className="products">{productList}</div>
      <div className="cart">
        <h3>Cart Contents</h3>
        <ul>{cartList}</ul>
      </div>
      <br></br>
      <footer></footer>
    </>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById('root'));

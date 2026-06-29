import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';

function CartTestHelper() {
  const { items, addItem, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  return (
    <div>
      <div data-testid="cart-subtotal">{subtotal}</div>
      <div data-testid="cart-count">{items.length}</div>
      <ul>
        {items.map(item => (
          <li key={item.id} data-testid={`item-${item.id}`}>
            {item.name} - Qty: {item.quantity}
          </li>
        ))}
      </ul>
      <button onClick={() => addItem({ id: 'p1', name: 'Hazelnut Bliss', price: 29900 })}>
        Add Product
      </button>
      <button onClick={() => updateQuantity('p1', 5)}>
        Set Qty 5
      </button>
      <button onClick={() => removeItem('p1')}>
        Remove Product
      </button>
      <button onClick={clearCart}>
        Clear Cart
      </button>
    </div>
  );
}

describe('Cart Context State Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with an empty cart list', () => {
    render(
      <CartProvider>
        <CartTestHelper />
      </CartProvider>
    );

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('0');
  });

  it('should add items and compute subtotal correctly', () => {
    render(
      <CartProvider>
        <CartTestHelper />
      </CartProvider>
    );

    const addBtn = screen.getByText('Add Product');
    act(() => {
      addBtn.click();
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('1');
    expect(screen.getByTestId('item-p1')).toHaveTextContent('Hazelnut Bliss - Qty: 1');
    expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('29900');
  });

  it('should update quantity correctly', () => {
    render(
      <CartProvider>
        <CartTestHelper />
      </CartProvider>
    );

    const addBtn = screen.getByText('Add Product');
    const updateBtn = screen.getByText('Set Qty 5');

    act(() => {
      addBtn.click();
    });
    act(() => {
      updateBtn.click();
    });

    expect(screen.getByTestId('item-p1')).toHaveTextContent('Hazelnut Bliss - Qty: 5');
    expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('149500'); // 29900 * 5
  });

  it('should remove items correctly', () => {
    render(
      <CartProvider>
        <CartTestHelper />
      </CartProvider>
    );

    const addBtn = screen.getByText('Add Product');
    const removeBtn = screen.getByText('Remove Product');

    act(() => {
      addBtn.click();
    });
    act(() => {
      removeBtn.click();
    });

    expect(screen.getByTestId('cart-count')).toHaveTextContent('0');
  });
});

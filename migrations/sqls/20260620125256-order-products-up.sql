/* Replace with your SQL commands */
CREATE TABLE order_products (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    order_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
CONSTRAINT fk_order_products_order
    FOREIGN KEY (order_id) 
    REFERENCES orders(id) 
    ON DELETE CASCADE,
CONSTRAINT fk_order_products_product
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE
);
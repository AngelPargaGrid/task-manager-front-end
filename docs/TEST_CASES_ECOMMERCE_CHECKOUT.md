# E-Commerce Checkout – Comprehensive Test Cases

## Overview

This document defines 35+ test cases for an e-commerce checkout process, covering cart management, discount codes, payment processing, order confirmation, and email notifications. Aligns with PCI compliance and security best practices.

---

## Test Data Generation Strategy

### Product Catalog (Fixtures)

| Product ID | Name | Price | Stock |
|------------|------|-------|-------|
| PROD-001 | Wireless Mouse | 29.99 | 100 |
| PROD-002 | USB-C Cable | 12.99 | 200 |
| PROD-003 | Laptop Stand | 49.99 | 50 |

### Discount Codes

| Code | Type | Value | Min Order | Max Uses |
|------|------|-------|-----------|----------|
| SAVE10 | percent | 10% | 0 | 100 |
| FLAT20 | fixed | $20 | 50 | 50 |
| EXPIRED | percent | 15% | 0 | 100 (expired) |
| INVALID | — | — | — | — |

### Payment Test Data

| Card Number | Result |
|-------------|--------|
| 4242424242424242 | Success |
| 4000000000000002 | Declined |
| 4000000000000127 | Insufficient funds |
| invalid | Validation error |

### User Credentials

```
customer@checkout-test.com / customer123
```

---

## 1. Positive Test Cases (Success Flow)

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| CHK-P01 | Add single item to cart | POST /cart/items with product_id, quantity=1 | 201, item in cart |
| CHK-P02 | Add multiple items to cart | POST items PROD-001 x2, PROD-002 x1 | 201, cart total correct |
| CHK-P03 | Update cart item quantity | PUT /cart/items/{id} quantity=3 | 200, quantity updated |
| CHK-P04 | Remove item from cart | DELETE /cart/items/{id} | 200, item removed |
| CHK-P05 | Apply valid percent discount | POST /cart/discount code=SAVE10 | 200, discount applied |
| CHK-P06 | Apply valid fixed discount | POST /cart/discount code=FLAT20 (order ≥ $50) | 200, $20 off |
| CHK-P07 | Successful payment processing | POST /checkout with valid card | 200, order created |
| CHK-P08 | Order confirmation returned | After checkout | Order ID, status=confirmed |
| CHK-P09 | Email notification sent | After checkout | Email queued/sent |
| CHK-P10 | Cart cleared after checkout | GET /cart after checkout | Cart empty |
| CHK-P11 | Order history updated | GET /orders after checkout | New order in list |
| CHK-P12 | Inventory decremented | After checkout | Stock reduced by quantity |

---

## 2. Negative Test Cases (Failures)

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| CHK-N01 | Add non-existent product | POST product_id=99999 | 404 Not Found |
| CHK-N02 | Add zero quantity | POST quantity=0 | 400 Bad Request |
| CHK-N03 | Add negative quantity | POST quantity=-1 | 400 Bad Request |
| CHK-N04 | Invalid discount code | POST /cart/discount code=INVALID | 400, "Invalid code" |
| CHK-N05 | Expired discount code | POST code=EXPIRED | 400, "Code expired" |
| CHK-N06 | Discount below min order | POST FLAT20 with $30 cart | 400, "Min order $50" |
| CHK-N07 | Discount exceeds max uses | Apply FLAT20 51+ times | 400, "Code limit reached" |
| CHK-N08 | Payment declined | POST checkout card=4000000000000002 | 402, "Payment declined" |
| CHK-N09 | Insufficient funds | POST checkout card=4000000000000127 | 402 |
| CHK-N10 | Invalid card number format | POST checkout card="invalid" | 400, validation error |
| CHK-N11 | Missing required payment fields | POST checkout without card | 400 |
| CHK-N12 | Checkout empty cart | POST /checkout with empty cart | 400, "Cart is empty" |
| CHK-N13 | Unauthenticated cart access | GET /cart without token | 401 Unauthorized |
| CHK-N14 | Unauthenticated checkout | POST /checkout without token | 401 |

---

## 3. Edge Cases

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| CHK-E01 | Empty cart add then checkout | Add item, remove all, checkout | 400 or cart empty |
| CHK-E02 | Cart quantity at stock limit | Add quantity = available stock | 200 |
| CHK-E03 | Cart quantity exceeds stock | Add quantity > stock | 400 or capped to stock |
| CHK-E04 | Cart item limit (e.g., 50 items) | Add 51 distinct items | 400 or limit enforced |
| CHK-E05 | Multiple discount codes | Apply SAVE10 then FLAT20 | 400 or last wins per policy |
| CHK-E06 | Concurrent cart updates | Two requests add same item | No race, correct total |
| CHK-E07 | Concurrent checkout same cart | Two checkout requests | One succeeds, one 409 |
| CHK-E08 | Checkout after product deleted | Product removed, cart has ref | 400 or item removed |
| CHK-E09 | Discount on exactly min order | Cart=$50, apply FLAT20 | 200 |
| CHK-E10 | Very large order amount | Cart total $999,999 | 200 or limit per policy |

---

## 4. Security Test Cases

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| CHK-S01 | SQL injection in product_id | product_id="'; DROP TABLE carts;--" | 400/404, no SQL execution |
| CHK-S02 | SQL injection in discount code | code="' OR '1'='1" | 400, invalid code |
| CHK-S03 | XSS in discount code | code="<script>alert(1)</script>" | Sanitized or rejected |
| CHK-S04 | Card number not logged | Checkout then inspect logs | No plaintext card in logs |
| CHK-S05 | Card number not in response | Checkout response | No card number in JSON |
| CHK-S06 | PCI: No card storage | Checkout with card | Card not persisted in DB |
| CHK-S07 | CSRF on checkout | POST without CSRF token | 403 or validated |
| CHK-S08 | IDOR: Access other user cart | GET /cart with other user's session | 403 or own cart only |
| CHK-S09 | IDOR: View other user order | GET /orders/{other_id} | 403 |
| CHK-S10 | Rate limit checkout | 20 checkout requests in 1 min | 429 after limit |

---

## 5. Email Notification Test Cases

| ID | Scenario | Steps | Expected Result |
|----|----------|-------|-----------------|
| CHK-EM01 | Order confirmation email | Successful checkout | Email sent to user |
| CHK-EM02 | Email contains order details | Inspect email body | Order ID, items, total |
| CHK-EM03 | No email on failed payment | Declined checkout | No confirmation email |
| CHK-EM04 | Invalid email format | Register with bad email | 400 on register |

---

## Test Data Generation Strategy (Detail)

1. **Products**: Seeded in `products` fixture from `api/tests/test_ecommerce_checkout.py`
2. **Discounts**: Seeded in `discount_codes` fixture; EXPIRED code has `expires_at` in past
3. **Users**: Created via `checkout_user` fixture (register + login)
4. **Payment**: Mock processor; card endings 0002 (declined), 0127 (insufficient), 4242... (success)
5. **Isolation**: Each test gets fresh DB (pytest-flask app fixture); products/discounts re-seeded when missing

## Acceptance Criteria Checklist

- [x] 30+ test cases across all categories
- [x] Positive: successful checkout flow (CHK-P01–P12)
- [x] Negative: payment failures, invalid codes (CHK-N01–N14)
- [x] Edge: cart limits, concurrent purchases (CHK-E01–E10)
- [x] Security: PCI compliance, data validation, SQL injection (CHK-S01–S10)
- [x] Test data generation strategy defined
- [x] Automated scripts executable and passing (32 pytest tests)

---

## Implementation Mapping

| Test ID | pytest test name |
|---------|------------------|
| CHK-P01 | test_chk_p01_add_single_item_to_cart |
| CHK-P02 | test_chk_p02_add_multiple_items |
| CHK-P05 | test_chk_p05_apply_valid_percent_discount |
| CHK-P07 | test_chk_p07_successful_payment_processing |
| CHK-N04 | test_chk_n04_invalid_discount_code |
| CHK-N08 | test_chk_n08_payment_declined |
| CHK-E02 | test_chk_e02_cart_at_stock_limit |
| CHK-S01 | test_chk_s01_sql_injection_product_id |

**Run tests:**
```bash
cd api
python3 -m pytest tests/test_ecommerce_checkout.py -v
```
**32 automated tests, all passing.**

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-03-11 | Initial e-commerce checkout test cases |

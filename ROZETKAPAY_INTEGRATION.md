# RozetkaPay Payment Integration

## Обзор

Реализована полная интеграция платёжной системы **RozetkaPay** с использованием **Direct Checkout** flow.

### Что реализовано:

✅ **Backend (FastAPI):**
- RozetkaPay service (`/app/backend/rozetkapay_service.py`)
- API endpoints для создания платежей
- Webhook endpoint для обработки уведомлений от RozetkaPay
- Валидация webhook signatures (SHA1-based)
- Сохранение транзакций в MongoDB

✅ **Frontend (React):**
- RozetkaPay Widget компонент (`/app/frontend/src/components/RozetkaPayWidget.js`)
- Интеграция в страницу Checkout
- Токенизация карт через RozetkaPay Widget
- Обработка 3DS аутентификации

## Архитектура Flow

### 1. Пользователь выбирает "Оплатити зараз"
- На странице Checkout отображается RozetkaPay Widget
- Widget загружается с CDN: `https://cdn.rozetkapay.com/widget.js`

### 2. Пользователь вводит данные карты
- Widget токенизирует данные карты
- Токен возвращается в компонент через callback `onToken`
- Токен сохраняется в state компонента Checkout

### 3. Пользователь нажимает "Підтвердити замовлення"
- Создаётся заказ в БД
- Отправляется запрос на `/api/payment/rozetkapay/create`
- Backend создаёт платеж через RozetkaPay API

### 4. Обработка платежа
- Если требуется 3DS: пользователь редиректится на страницу банка
- После успешной аутентификации: редирект на `result_url`
- RozetkaPay отправляет webhook на `/api/payment/rozetkapay/webhook`

### 5. Обновление статуса
- Webhook обновляет статус заказа в БД
- Пользователь видит страницу успеха

## Настройка

### Backend Environment Variables (`.env`):

```env
ROZETKAPAY_API_URL=https://api.rozetkapay.com
ROZETKAPAY_LOGIN=7e5ba9f2-572b-4fb9-af69-d243c5ab56a6
ROZETKAPAY_PASSWORD=ZE9lcjdnWng5S0RKRHFhR2tQYTRWSnRa
ROZETKAPAY_WIDGET_KEY=<получить от RozetkaPay>
```

**Текущие credentials - ТЕСТОВЫЕ**. Для продакшена нужно получить боевые данные.

### Получение Widget Key:

Widget Key выдаётся RozetkaPay при регистрации проекта.
1. Зарегистрируйтесь на https://business.rozetkapay.com
2. Создайте проект
3. Получите Widget Key в настройках проекта

## API Endpoints

### 1. Получение Widget Key
```
GET /api/payment/rozetkapay/widget-key
```

**Response:**
```json
{
  "widget_key": "hQ8aqcm/RG1RF7MaImmzZUsThYhAVDG6R7kazf9+r7zuoWo6"
}
```

### 2. Создание платежа
```
POST /api/payment/rozetkapay/create
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "external_id": "ORDER-123456",
  "amount": 1500.50,
  "currency": "UAH",
  "card_token": "token_from_widget",
  "customer": {
    "email": "customer@example.com",
    "first_name": "Іван",
    "last_name": "Іванов",
    "phone": "+380501234567"
  },
  "description": "Оплата замовлення ORDER-123456"
}
```

**Response (успех):**
```json
{
  "success": true,
  "payment_id": "12345",
  "external_id": "ORDER-123456",
  "is_success": true,
  "action_required": false,
  "status": "success",
  "message": "Payment created successfully"
}
```

**Response (требуется 3DS):**
```json
{
  "success": true,
  "payment_id": "12345",
  "external_id": "ORDER-123456",
  "is_success": false,
  "action_required": true,
  "action": {
    "type": "url",
    "value": "https://3ds.bank.com/verify?token=..."
  },
  "status": "pending",
  "message": "Payment created successfully"
}
```

### 3. Webhook Endpoint
```
POST /api/payment/rozetkapay/webhook
X-ROZETKAPAY-SIGNATURE: {signature}
```

Этот endpoint вызывается RozetkaPay при изменении статуса платежа.

**Webhook Payload:**
```json
{
  "id": "12345",
  "external_id": "ORDER-123456",
  "is_success": true,
  "details": {
    "status": "success",
    "amount": "1500.50",
    "currency": "UAH"
  }
}
```

## Тестирование

### Тестовые карты:

| Номер карты        | CVV | Exp Date | 3DS | Результат |
|--------------------|-----|----------|-----|-----------|
| 4242 4242 4242 4242| any | any      | yes | success   |
| 5454 5454 5454 5454| any | any      | yes | success   |
| 4111 1111 1111 1111| any | any      | no  | success   |
| 5555 5555 5555 4444| any | any      | no  | success   |
| 4200 0000 0000 0000| any | any      | yes | rejected  |

### Тестирование Flow:

1. Добавьте товар в корзину
2. Перейдите на страницу Checkout
3. Заполните данные получателя
4. Выберите "Оплатити зараз"
5. Введите тестовые данные карты в виджет
6. Нажмите "Підтвердити замовлення"
7. Проверьте статус заказа в БД

## Безопасность

### Webhook Signature Verification:

Каждый webhook от RozetkaPay подписан. Сигнатура проверяется по алгоритму:

```python
signature = base64url_encode(
    sha1(password + base64url_encode(json_body) + password)
)
```

Это предотвращает поддельные webhook-и от злоумышленников.

### PCI DSS Compliance:

- ✅ Данные карт никогда не хранятся на нашем сервере
- ✅ Токенизация происходит на стороне RozetkaPay
- ✅ Используется HTTPS для всех запросов
- ✅ Webhook-и валидируются по signature

## Известные Issue

### Issue #1: Баг с пустой корзиной при редиректе на Checkout

**Статус:** В процессе исправления

**Описание:** После добавления товара и редиректа на `/checkout`, корзина отображается пустой.

**Причина:** Race condition - редирект происходит до завершения API запроса `addToCart`.

**Решение:** Будет исправлено в следующем коммите.

## Продакшн Deployment

Перед деплоем в продакшн:

1. ✅ Получите боевые credentials от RozetkaPay
2. ✅ Обновите `.env` с production данными
3. ✅ Настройте webhook URL в личном кабинете RozetkaPay
4. ✅ Протестируйте с реальными картами (малые суммы)
5. ✅ Настройте мониторинг webhook-ов

## Дополнительные ресурсы

- [RozetkaPay API Docs](https://cdn.rozetkapay.com/public-docs/index.html)
- [Тестовая среда](https://business.rozetkapay.com)
- Email поддержки: ecomsupport@rozetkapay.com

## Следующие шаги

- [ ] Исправить баг с корзиной
- [ ] Добавить обработку ошибок платежей
- [ ] Реализовать refund функционал
- [ ] Добавить админ панель для просмотра транзакций
- [ ] Интегрировать рекуррентные платежи

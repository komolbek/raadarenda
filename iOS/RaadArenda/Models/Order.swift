import Foundation

struct Order: Identifiable, Hashable, Codable {
    let id: String
    let orderNumber: String
    let userId: String
    let status: OrderStatus
    let items: [OrderItem]
    let deliveryType: DeliveryType
    let deliveryAddress: Address?
    let deliveryFee: Int
    let subtotal: Int
    let totalAmount: Int
    let totalSavings: Int
    let rentalStartDate: Date
    let rentalEndDate: Date
    let paymentMethod: PaymentMethod
    let paymentStatus: PaymentStatus
    let notes: String?
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case orderNumber = "order_number"
        case userId = "user_id"
        case status
        case items
        case deliveryType = "delivery_type"
        case deliveryAddress = "delivery_address"
        case deliveryFee = "delivery_fee"
        case subtotal
        case totalAmount = "total_amount"
        case totalSavings = "total_savings"
        case rentalStartDate = "rental_start_date"
        case rentalEndDate = "rental_end_date"
        case paymentMethod = "payment_method"
        case paymentStatus = "payment_status"
        case notes
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }

    var rentalDays: Int {
        Calendar.current.dateComponents([.day], from: rentalStartDate, to: rentalEndDate).day ?? 1
    }
}

enum OrderStatus: String, Codable, CaseIterable {
    case confirmed = "CONFIRMED"
    case preparing = "PREPARING"
    case delivered = "DELIVERED"
    case returned = "RETURNED"
    case cancelled = "CANCELLED"

    var displayName: String {
        switch self {
        case .confirmed: return "Подтверждён"
        case .preparing: return "Подготовка"
        case .delivered: return "Доставлен"
        case .returned: return "Возвращён"
        case .cancelled: return "Отменён"
        }
    }

    var color: String {
        switch self {
        case .confirmed: return "blue"
        case .preparing: return "orange"
        case .delivered: return "green"
        case .returned: return "gray"
        case .cancelled: return "red"
        }
    }
}

enum DeliveryType: String, Codable {
    case delivery = "DELIVERY"
    case selfPickup = "SELF_PICKUP"

    var displayName: String {
        switch self {
        case .delivery: return "Доставка"
        case .selfPickup: return "Самовывоз"
        }
    }
}

enum PaymentMethod: String, Codable {
    case cash = "CASH"
    case online = "ONLINE"

    var displayName: String {
        switch self {
        case .cash: return "Наличные"
        case .online: return "Онлайн"
        }
    }
}

enum PaymentStatus: String, Codable {
    case pending = "PENDING"
    case paid = "PAID"
    case refunded = "REFUNDED"

    var displayName: String {
        switch self {
        case .pending: return "Ожидает оплаты"
        case .paid: return "Оплачено"
        case .refunded: return "Возвращено"
        }
    }
}

struct OrderItem: Identifiable, Hashable, Codable {
    let id: String
    let productId: String
    let productName: String
    let productPhoto: String?
    let quantity: Int
    let dailyPrice: Int
    let totalPrice: Int
    let savings: Int

    enum CodingKeys: String, CodingKey {
        case id
        case productId = "product_id"
        case productName = "product_name"
        case productPhoto = "product_photo"
        case quantity
        case dailyPrice = "daily_price"
        case totalPrice = "total_price"
        case savings
    }
}

// MARK: - API Response

struct OrdersResponse: Codable {
    let success: Bool
    let data: [Order]
    let message: String?
    let pagination: PaginationInfo?
}

struct OrderResponse: Codable {
    let success: Bool
    let data: Order
    let message: String?
}

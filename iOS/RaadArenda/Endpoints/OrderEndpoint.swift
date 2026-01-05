import Foundation

enum OrderEndpoint: APIEndpoint {
    case createOrder(request: CreateOrderRequest)
    case getOrders(page: Int, limit: Int, status: OrderStatus?)
    case getOrder(id: String)

    var path: String {
        switch self {
        case .createOrder:
            return "/orders"
        case .getOrders:
            return "/orders/my-orders"
        case .getOrder(let id):
            return "/orders/\(id)"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .createOrder:
            return .post
        case .getOrders, .getOrder:
            return .get
        }
    }

    var queryParams: [String: String] {
        switch self {
        case .createOrder, .getOrder:
            return [:]
        case .getOrders(let page, let limit, let status):
            var params = [
                "page": String(page),
                "limit": String(limit)
            ]
            if let status = status {
                params["status"] = status.rawValue
            }
            return params
        }
    }

    var body: Encodable? {
        switch self {
        case .createOrder(let request):
            return request
        case .getOrders, .getOrder:
            return nil
        }
    }

    var requiresAuth: Bool {
        return true
    }
}

// MARK: - Request Models

struct CreateOrderRequest: Codable {
    let items: [CreateOrderItem]
    let deliveryType: String
    let deliveryAddressId: String?
    let rentalStartDate: String
    let rentalEndDate: String
    let paymentMethod: String
    let notes: String?

    enum CodingKeys: String, CodingKey {
        case items
        case deliveryType = "delivery_type"
        case deliveryAddressId = "delivery_address_id"
        case rentalStartDate = "rental_start_date"
        case rentalEndDate = "rental_end_date"
        case paymentMethod = "payment_method"
        case notes
    }
}

struct CreateOrderItem: Codable {
    let productId: String
    let quantity: Int

    enum CodingKeys: String, CodingKey {
        case productId = "product_id"
        case quantity
    }
}

import Foundation

protocol OrderServiceProtocol {
    func createOrder(from cart: Cart, paymentMethod: PaymentMethod, notes: String?) async throws -> Order
    func getOrders(page: Int, limit: Int, status: OrderStatus?) async throws -> OrdersResponse
    func getOrder(id: String) async throws -> Order
}

final class OrderService: OrderServiceProtocol {
    private let networkManager: NetworkManager

    init(networkManager: NetworkManager = .shared) {
        self.networkManager = networkManager
    }

    func createOrder(from cart: Cart, paymentMethod: PaymentMethod, notes: String?) async throws -> Order {
        guard !cart.isEmpty else {
            throw OrderError.emptyCart
        }

        guard let firstItem = cart.items.first else {
            throw OrderError.emptyCart
        }

        let formatter = ISO8601DateFormatter()

        let orderItems = cart.items.map { item in
            CreateOrderItem(productId: item.product.id, quantity: item.quantity)
        }

        let request = CreateOrderRequest(
            items: orderItems,
            deliveryType: cart.deliveryType.rawValue,
            deliveryAddressId: cart.deliveryAddressId,
            rentalStartDate: formatter.string(from: firstItem.rentalStartDate),
            rentalEndDate: formatter.string(from: firstItem.rentalEndDate),
            paymentMethod: paymentMethod.rawValue,
            notes: notes
        )

        let endpoint = OrderEndpoint.createOrder(request: request)
        let response: OrderResponse = try await networkManager.request(endpoint)
        return response.data
    }

    func getOrders(page: Int = 1, limit: Int = 20, status: OrderStatus? = nil) async throws -> OrdersResponse {
        let endpoint = OrderEndpoint.getOrders(page: page, limit: limit, status: status)
        return try await networkManager.request(endpoint)
    }

    func getOrder(id: String) async throws -> Order {
        let endpoint = OrderEndpoint.getOrder(id: id)
        let response: OrderResponse = try await networkManager.request(endpoint)
        return response.data
    }
}

enum OrderError: LocalizedError {
    case emptyCart
    case invalidDates
    case addressRequired

    var errorDescription: String? {
        switch self {
        case .emptyCart:
            return "Корзина пуста"
        case .invalidDates:
            return "Неверные даты аренды"
        case .addressRequired:
            return "Укажите адрес доставки"
        }
    }
}

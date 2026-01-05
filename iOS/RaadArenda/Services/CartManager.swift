import Foundation
import SwiftUI

@MainActor
final class CartManager: ObservableObject {
    @Published private(set) var cart: Cart = Cart()
    @Published var deliveryFee: Int = 0

    private let cartKey = "saved_cart"

    var isEmpty: Bool { cart.isEmpty }
    var itemCount: Int { cart.itemCount }
    var subtotal: Int { cart.subtotal }
    var totalSavings: Int { cart.totalSavings }
    var total: Int { cart.subtotal + deliveryFee }
    var items: [CartItem] { cart.items }
    var deliveryType: DeliveryType { cart.deliveryType }
    var deliveryAddressId: String? { cart.deliveryAddressId }

    init() {
        loadCart()
    }

    // MARK: - Cart Operations

    func addItem(_ product: Product, quantity: Int, startDate: Date, endDate: Date) {
        cart.addItem(product, quantity: quantity, startDate: startDate, endDate: endDate)
        saveCart()
    }

    func updateQuantity(itemId: String, quantity: Int) {
        cart.updateQuantity(itemId: itemId, quantity: quantity)
        saveCart()
    }

    func removeItem(itemId: String) {
        cart.removeItem(itemId: itemId)
        saveCart()
    }

    func setDeliveryType(_ type: DeliveryType) {
        cart.deliveryType = type
        updateDeliveryFee()
        saveCart()
    }

    func setDeliveryAddress(_ addressId: String?) {
        cart.deliveryAddressId = addressId
        saveCart()
    }

    func clear() {
        cart.clear()
        deliveryFee = 0
        saveCart()
    }

    // MARK: - Delivery Fee

    private func updateDeliveryFee() {
        switch cart.deliveryType {
        case .selfPickup:
            deliveryFee = 0
        case .delivery:
            // Tashkent is free, regions have fee
            // This will be fetched from API based on selected address
            deliveryFee = 0 // Default to free (Tashkent)
        }
    }

    func setDeliveryFee(_ fee: Int) {
        deliveryFee = fee
    }

    // MARK: - Persistence

    private func saveCart() {
        if let data = try? JSONEncoder().encode(cart) {
            UserDefaults.standard.set(data, forKey: cartKey)
        }
    }

    private func loadCart() {
        if let data = UserDefaults.standard.data(forKey: cartKey),
           let savedCart = try? JSONDecoder().decode(Cart.self, from: data) {
            cart = savedCart
            updateDeliveryFee()
        }
    }
}

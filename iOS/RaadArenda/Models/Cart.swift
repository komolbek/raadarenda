import Foundation

struct CartItem: Identifiable, Hashable, Codable {
    let id: String
    let product: Product
    var quantity: Int
    var rentalStartDate: Date
    var rentalEndDate: Date

    var rentalDays: Int {
        max(1, Calendar.current.dateComponents([.day], from: rentalStartDate, to: rentalEndDate).day ?? 1)
    }

    var totalPrice: Int {
        calculatePrice()
    }

    var savings: Int {
        let fullPrice = product.dailyPrice * quantity * rentalDays
        return fullPrice - totalPrice
    }

    var savingsPercentage: Int {
        let fullPrice = product.dailyPrice * quantity * rentalDays
        guard fullPrice > 0 else { return 0 }
        return Int((Double(savings) / Double(fullPrice)) * 100)
    }

    private func calculatePrice() -> Int {
        // If single day, use quantity pricing
        if rentalDays == 1 {
            // Find matching quantity tier
            if let quantityTier = product.quantityPricing.first(where: { $0.quantity == quantity }) {
                return quantityTier.totalPrice
            }
            // Otherwise calculate based on daily price
            return product.dailyPrice * quantity
        }

        // For multiple days, use day pricing tiers
        // Find matching day tier
        if let dayTier = product.pricingTiers.first(where: { $0.days == rentalDays }) {
            return dayTier.totalPrice * quantity
        }

        // If no exact tier match, find the closest lower tier
        let sortedTiers = product.pricingTiers.sorted { $0.days < $1.days }
        if let closestTier = sortedTiers.last(where: { $0.days <= rentalDays }) {
            // Use closest tier price per day for remaining days
            let tierPricePerDay = closestTier.totalPrice / closestTier.days
            return tierPricePerDay * rentalDays * quantity
        }

        // Fallback to daily price
        return product.dailyPrice * rentalDays * quantity
    }
}

struct Cart: Codable {
    var items: [CartItem]
    var deliveryType: DeliveryType
    var deliveryAddressId: String?

    var isEmpty: Bool {
        items.isEmpty
    }

    var itemCount: Int {
        items.count
    }

    var totalQuantity: Int {
        items.reduce(0) { $0 + $1.quantity }
    }

    var subtotal: Int {
        items.reduce(0) { $0 + $1.totalPrice }
    }

    var totalSavings: Int {
        items.reduce(0) { $0 + $1.savings }
    }

    init() {
        self.items = []
        self.deliveryType = .delivery
        self.deliveryAddressId = nil
    }

    mutating func addItem(_ product: Product, quantity: Int, startDate: Date, endDate: Date) {
        // Check if product already in cart with same dates
        if let index = items.firstIndex(where: {
            $0.product.id == product.id &&
            Calendar.current.isDate($0.rentalStartDate, inSameDayAs: startDate) &&
            Calendar.current.isDate($0.rentalEndDate, inSameDayAs: endDate)
        }) {
            items[index].quantity += quantity
        } else {
            let item = CartItem(
                id: UUID().uuidString,
                product: product,
                quantity: quantity,
                rentalStartDate: startDate,
                rentalEndDate: endDate
            )
            items.append(item)
        }
    }

    mutating func updateQuantity(itemId: String, quantity: Int) {
        if let index = items.firstIndex(where: { $0.id == itemId }) {
            if quantity > 0 {
                items[index].quantity = quantity
            } else {
                items.remove(at: index)
            }
        }
    }

    mutating func updateDates(itemId: String, startDate: Date, endDate: Date) {
        if let index = items.firstIndex(where: { $0.id == itemId }) {
            items[index].rentalStartDate = startDate
            items[index].rentalEndDate = endDate
        }
    }

    mutating func updateItem(itemId: String, quantity: Int, startDate: Date, endDate: Date) {
        if let index = items.firstIndex(where: { $0.id == itemId }) {
            items[index].quantity = quantity
            items[index].rentalStartDate = startDate
            items[index].rentalEndDate = endDate
        }
    }

    mutating func removeItem(itemId: String) {
        items.removeAll { $0.id == itemId }
    }

    mutating func clear() {
        items.removeAll()
        deliveryAddressId = nil
    }
}

import SwiftUI

struct CartTab: View {
    @ObservedObject var coordinator: MainCoordinator

    var body: some View {
        NavigationStack(path: $coordinator.cartPath) {
            CartView(coordinator: coordinator)
                .navigationDestination(for: CartRoute.self) { route in
                    switch route {
                    case .checkout:
                        CheckoutView(coordinator: coordinator)
                    case .orderConfirmation(let orderId):
                        OrderConfirmationView(orderId: orderId, coordinator: coordinator)
                    }
                }
        }
    }
}

struct CartView: View {
    @ObservedObject var coordinator: MainCoordinator
    @EnvironmentObject var cartManager: CartManager

    var body: some View {
        Group {
            if cartManager.isEmpty {
                EmptyCartView()
            } else {
                ScrollView {
                    VStack(spacing: 16) {
                        ForEach(cartManager.items) { item in
                            CartItemRow(item: item)
                        }

                        Divider()
                            .padding(.vertical)

                        // Summary
                        VStack(spacing: 12) {
                            HStack {
                                Text("Подытог")
                                Spacer()
                                Text(formatPrice(cartManager.subtotal))
                            }

                            if cartManager.totalSavings > 0 {
                                HStack {
                                    Text("Экономия")
                                        .foregroundColor(.green)
                                    Spacer()
                                    Text("-\(formatPrice(cartManager.totalSavings))")
                                        .foregroundColor(.green)
                                }
                            }

                            if cartManager.deliveryFee > 0 {
                                HStack {
                                    Text("Доставка")
                                    Spacer()
                                    Text(formatPrice(cartManager.deliveryFee))
                                }
                            } else {
                                HStack {
                                    Text("Доставка")
                                    Spacer()
                                    Text("Бесплатно")
                                        .foregroundColor(.green)
                                }
                            }

                            Divider()

                            HStack {
                                Text("Итого")
                                    .font(.headline)
                                Spacer()
                                Text(formatPrice(cartManager.total))
                                    .font(.headline)
                            }
                        }
                        .font(.subheadline)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                    }
                    .padding()
                }
                .safeAreaInset(edge: .bottom) {
                    Button {
                        coordinator.showCheckout()
                    } label: {
                        Text("Оформить заказ")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Color.accentColor)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                    .padding()
                    .background(.ultraThinMaterial)
                }
            }
        }
        .navigationTitle("Корзина")
        .toolbar {
            if !cartManager.isEmpty {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Очистить") {
                        cartManager.clear()
                    }
                    .foregroundColor(.red)
                }
            }
        }
    }

    private func formatPrice(_ price: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = " "
        return "\(formatter.string(from: NSNumber(value: price)) ?? "\(price)") сум"
    }
}

struct EmptyCartView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "cart")
                .font(.system(size: 60))
                .foregroundColor(.secondary)

            Text("Корзина пуста")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Добавьте товары из каталога")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }
}

struct CartItemRow: View {
    let item: CartItem
    @EnvironmentObject var cartManager: CartManager

    var body: some View {
        HStack(spacing: 12) {
            // Image
            AsyncImage(url: URL(string: item.product.primaryPhoto ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color(.systemGray5))
            }
            .frame(width: 80, height: 80)
            .clipShape(RoundedRectangle(cornerRadius: 8))

            VStack(alignment: .leading, spacing: 4) {
                Text(item.product.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .lineLimit(2)

                Text("\(formatDate(item.rentalStartDate)) - \(formatDate(item.rentalEndDate))")
                    .font(.caption)
                    .foregroundColor(.secondary)

                HStack {
                    Text(formatPrice(item.totalPrice))
                        .font(.subheadline)
                        .fontWeight(.semibold)

                    if item.savingsPercentage > 0 {
                        Text("-\(item.savingsPercentage)%")
                            .font(.caption)
                            .foregroundColor(.green)
                    }
                }

                // Quantity controls
                HStack {
                    Button {
                        cartManager.updateQuantity(itemId: item.id, quantity: item.quantity - 1)
                    } label: {
                        Image(systemName: "minus.circle")
                            .foregroundColor(.accentColor)
                    }

                    Text("\(item.quantity)")
                        .frame(width: 30)

                    Button {
                        cartManager.updateQuantity(itemId: item.id, quantity: item.quantity + 1)
                    } label: {
                        Image(systemName: "plus.circle")
                            .foregroundColor(.accentColor)
                    }

                    Spacer()

                    Button {
                        cartManager.removeItem(itemId: item.id)
                    } label: {
                        Image(systemName: "trash")
                            .foregroundColor(.red)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 5, y: 2)
    }

    private func formatPrice(_ price: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = " "
        return "\(formatter.string(from: NSNumber(value: price)) ?? "\(price)") сум"
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM"
        formatter.locale = Locale(identifier: "ru_RU")
        return formatter.string(from: date)
    }
}

#Preview {
    CartTab(coordinator: MainCoordinator(appCoordinator: nil))
        .environmentObject(CartManager())
}

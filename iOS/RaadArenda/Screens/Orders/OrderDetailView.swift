import SwiftUI

struct OrderDetailView: View {
    let order: Order
    @ObservedObject var coordinator: MainCoordinator

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Status Header
                VStack(spacing: 8) {
                    StatusBadge(status: order.status)
                    Text("Заказ #\(order.orderNumber)")
                        .font(.title2)
                        .fontWeight(.bold)
                    Text("от \(formatDateTime(order.createdAt))")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                // Rental Period
                VStack(alignment: .leading, spacing: 12) {
                    Text("Период аренды")
                        .font(.headline)

                    HStack {
                        VStack(alignment: .leading) {
                            Text("Начало")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text(formatDate(order.rentalStartDate))
                                .font(.subheadline)
                                .fontWeight(.medium)
                        }

                        Spacer()

                        Image(systemName: "arrow.right")
                            .foregroundColor(.secondary)

                        Spacer()

                        VStack(alignment: .trailing) {
                            Text("Конец")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text(formatDate(order.rentalEndDate))
                                .font(.subheadline)
                                .fontWeight(.medium)
                        }
                    }

                    Text("\(order.rentalDays) дней")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, alignment: .center)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                // Delivery Info
                VStack(alignment: .leading, spacing: 12) {
                    Text("Доставка")
                        .font(.headline)

                    HStack {
                        Image(systemName: order.deliveryType == .delivery ? "truck.box" : "building.2")
                        Text(order.deliveryType.displayName)
                    }
                    .font(.subheadline)

                    if let address = order.deliveryAddress {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(address.title)
                                .font(.subheadline)
                                .fontWeight(.medium)
                            Text(address.fullAddress)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                // Items
                VStack(alignment: .leading, spacing: 12) {
                    Text("Товары")
                        .font(.headline)

                    ForEach(order.items) { item in
                        HStack(spacing: 12) {
                            AsyncImage(url: URL(string: item.productPhoto ?? "")) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Rectangle()
                                    .fill(Color(.systemGray5))
                            }
                            .frame(width: 60, height: 60)
                            .clipShape(RoundedRectangle(cornerRadius: 8))

                            VStack(alignment: .leading, spacing: 4) {
                                Text(item.productName)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                Text("Количество: \(item.quantity)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }

                            Spacer()

                            Text(formatPrice(item.totalPrice))
                                .font(.subheadline)
                                .fontWeight(.medium)
                        }

                        if item.id != order.items.last?.id {
                            Divider()
                        }
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                // Payment & Total
                VStack(spacing: 12) {
                    HStack {
                        Text("Способ оплаты")
                        Spacer()
                        Text(order.paymentMethod.displayName)
                    }

                    HStack {
                        Text("Статус оплаты")
                        Spacer()
                        Text(order.paymentStatus.displayName)
                            .foregroundColor(order.paymentStatus == .paid ? .green : .orange)
                    }

                    Divider()

                    HStack {
                        Text("Подытог")
                        Spacer()
                        Text(formatPrice(order.subtotal))
                    }

                    if order.totalSavings > 0 {
                        HStack {
                            Text("Скидка")
                                .foregroundColor(.green)
                            Spacer()
                            Text("-\(formatPrice(order.totalSavings))")
                                .foregroundColor(.green)
                        }
                    }

                    HStack {
                        Text("Доставка")
                        Spacer()
                        Text(order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : "Бесплатно")
                            .foregroundColor(order.deliveryFee > 0 ? .primary : .green)
                    }

                    Divider()

                    HStack {
                        Text("Итого")
                            .font(.headline)
                        Spacer()
                        Text(formatPrice(order.totalAmount))
                            .font(.headline)
                    }
                }
                .font(.subheadline)
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                // Contact
                VStack(spacing: 12) {
                    Text("Нужна помощь?")
                        .font(.headline)

                    Button {
                        // Call business
                        if let url = URL(string: "tel://+998901234567") {
                            UIApplication.shared.open(url)
                        }
                    } label: {
                        HStack {
                            Image(systemName: "phone.fill")
                            Text("Позвонить")
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.accentColor)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)
            }
            .padding()
        }
        .navigationTitle("Детали заказа")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMMM yyyy"
        formatter.locale = Locale(identifier: "ru_RU")
        return formatter.string(from: date)
    }

    private func formatDateTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM yyyy, HH:mm"
        formatter.locale = Locale(identifier: "ru_RU")
        return formatter.string(from: date)
    }

    private func formatPrice(_ price: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = " "
        return "\(formatter.string(from: NSNumber(value: price)) ?? "\(price)") сум"
    }
}

#Preview {
    NavigationStack {
        OrderDetailView(
            order: Order(
                id: "1",
                orderNumber: "12345",
                userId: "1",
                status: .delivered,
                items: [
                    OrderItem(
                        id: "1",
                        productId: "1",
                        productName: "Кресло свадебное",
                        productPhoto: nil,
                        quantity: 2,
                        dailyPrice: 50000,
                        totalPrice: 160000,
                        savings: 40000
                    )
                ],
                deliveryType: .delivery,
                deliveryAddress: Address(
                    id: "1",
                    userId: "1",
                    title: "Дом",
                    fullAddress: "Ташкент, Чиланзар, ул. Примерная, д. 1",
                    city: "Ташкент",
                    district: "Чиланзар",
                    street: "Примерная",
                    building: "1",
                    apartment: nil,
                    entrance: nil,
                    floor: nil,
                    latitude: nil,
                    longitude: nil,
                    isDefault: true,
                    createdAt: Date()
                ),
                deliveryFee: 0,
                subtotal: 160000,
                totalAmount: 160000,
                totalSavings: 40000,
                rentalStartDate: Date(),
                rentalEndDate: Calendar.current.date(byAdding: .day, value: 3, to: Date())!,
                paymentMethod: .cash,
                paymentStatus: .pending,
                notes: nil,
                createdAt: Date(),
                updatedAt: Date()
            ),
            coordinator: MainCoordinator(appCoordinator: nil)
        )
    }
}

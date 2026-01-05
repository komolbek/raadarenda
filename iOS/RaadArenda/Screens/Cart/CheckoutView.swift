import SwiftUI

struct CheckoutView: View {
    @ObservedObject var coordinator: MainCoordinator
    @EnvironmentObject var cartManager: CartManager
    @StateObject private var viewModel = CheckoutViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Delivery Type
                VStack(alignment: .leading, spacing: 12) {
                    Text("Способ получения")
                        .font(.headline)

                    Picker("", selection: $viewModel.deliveryType) {
                        Text("Доставка").tag(DeliveryType.delivery)
                        Text("Самовывоз").tag(DeliveryType.selfPickup)
                    }
                    .pickerStyle(.segmented)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                // Delivery Address
                if viewModel.deliveryType == .delivery {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Адрес доставки")
                                .font(.headline)
                            Spacer()
                            Button("Добавить") {
                                viewModel.showAddressSheet = true
                            }
                            .font(.subheadline)
                        }

                        if viewModel.addresses.isEmpty {
                            Text("Добавьте адрес доставки")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        } else {
                            ForEach(viewModel.addresses) { address in
                                AddressRow(
                                    address: address,
                                    isSelected: viewModel.selectedAddressId == address.id
                                ) {
                                    viewModel.selectedAddressId = address.id
                                }
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                }

                // Payment Method
                VStack(alignment: .leading, spacing: 12) {
                    Text("Способ оплаты")
                        .font(.headline)

                    VStack(spacing: 8) {
                        PaymentMethodRow(
                            title: "Наличными при получении",
                            icon: "banknote",
                            isSelected: viewModel.paymentMethod == .cash
                        ) {
                            viewModel.paymentMethod = .cash
                        }

                        PaymentMethodRow(
                            title: "Онлайн (скоро)",
                            icon: "creditcard",
                            isSelected: viewModel.paymentMethod == .online,
                            isDisabled: true
                        ) {
                            // viewModel.paymentMethod = .online
                        }
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                // Notes
                VStack(alignment: .leading, spacing: 8) {
                    Text("Комментарий к заказу")
                        .font(.headline)

                    TextField("Дополнительная информация...", text: $viewModel.notes, axis: .vertical)
                        .lineLimit(3...5)
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(8)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(12)

                // Order Summary
                VStack(spacing: 12) {
                    Text("Ваш заказ")
                        .font(.headline)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    ForEach(cartManager.items) { item in
                        HStack {
                            Text("\(item.product.name) x\(item.quantity)")
                                .font(.subheadline)
                            Spacer()
                            Text(formatPrice(item.totalPrice))
                                .font(.subheadline)
                        }
                    }

                    Divider()

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

                    HStack {
                        Text("Доставка")
                        Spacer()
                        Text(cartManager.deliveryFee > 0 ? formatPrice(cartManager.deliveryFee) : "Бесплатно")
                            .foregroundColor(cartManager.deliveryFee > 0 ? .primary : .green)
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
        .navigationTitle("Оформление")
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .bottom) {
            Button {
                Task {
                    await viewModel.placeOrder(cart: cartManager.cart)
                }
            } label: {
                HStack {
                    if viewModel.isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Оформить заказ")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(viewModel.canPlaceOrder ? Color.accentColor : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            .disabled(!viewModel.canPlaceOrder || viewModel.isLoading)
            .padding()
            .background(.ultraThinMaterial)
        }
        .sheet(isPresented: $viewModel.showAddressSheet) {
            AddAddressSheet(viewModel: viewModel)
        }
        .alert("Ошибка", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(viewModel.errorMessage)
        }
        .onChange(of: viewModel.orderPlaced) { _, placed in
            if placed, let orderId = viewModel.placedOrderId {
                cartManager.clear()
                coordinator.cartPath.append(CartRoute.orderConfirmation(orderId: orderId))
            }
        }
        .task {
            await viewModel.loadAddresses()
        }
    }

    private func formatPrice(_ price: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = " "
        return "\(formatter.string(from: NSNumber(value: price)) ?? "\(price)") сум"
    }
}

struct AddressRow: View {
    let address: Address
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(address.title)
                        .font(.subheadline)
                        .fontWeight(.medium)
                    Text(address.fullAddress)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isSelected ? .accentColor : .secondary)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(8)
        }
        .buttonStyle(.plain)
    }
}

struct PaymentMethodRow: View {
    let title: String
    let icon: String
    let isSelected: Bool
    var isDisabled: Bool = false
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack {
                Image(systemName: icon)
                    .frame(width: 24)
                Text(title)
                    .font(.subheadline)
                Spacer()
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isSelected ? .accentColor : .secondary)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(8)
            .opacity(isDisabled ? 0.5 : 1)
        }
        .buttonStyle(.plain)
        .disabled(isDisabled)
    }
}

struct AddAddressSheet: View {
    @ObservedObject var viewModel: CheckoutViewModel
    @Environment(\.dismiss) var dismiss

    @State private var title = ""
    @State private var city = "Ташкент"
    @State private var district = ""
    @State private var street = ""
    @State private var building = ""
    @State private var apartment = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Название") {
                    TextField("Например: Дом", text: $title)
                }

                Section("Адрес") {
                    TextField("Город", text: $city)
                    TextField("Район", text: $district)
                    TextField("Улица", text: $street)
                    TextField("Дом", text: $building)
                    TextField("Квартира", text: $apartment)
                }
            }
            .navigationTitle("Новый адрес")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Отмена") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Сохранить") {
                        Task {
                            await viewModel.addAddress(
                                title: title,
                                city: city,
                                district: district,
                                street: street,
                                building: building,
                                apartment: apartment
                            )
                            dismiss()
                        }
                    }
                    .disabled(title.isEmpty || city.isEmpty)
                }
            }
        }
    }
}

@MainActor
final class CheckoutViewModel: ObservableObject {
    @Published var deliveryType: DeliveryType = .delivery
    @Published var addresses: [Address] = []
    @Published var selectedAddressId: String?
    @Published var paymentMethod: PaymentMethod = .cash
    @Published var notes: String = ""
    @Published var isLoading: Bool = false
    @Published var showError: Bool = false
    @Published var errorMessage: String = ""
    @Published var showAddressSheet: Bool = false
    @Published var orderPlaced: Bool = false
    @Published var placedOrderId: String?

    private let userService: UserServiceProtocol
    private let orderService: OrderServiceProtocol

    init(userService: UserServiceProtocol = UserService(), orderService: OrderServiceProtocol = OrderService()) {
        self.userService = userService
        self.orderService = orderService
    }

    var canPlaceOrder: Bool {
        if deliveryType == .delivery {
            return selectedAddressId != nil
        }
        return true
    }

    func loadAddresses() async {
        do {
            addresses = try await userService.getAddresses()
            if let defaultAddress = addresses.first(where: { $0.isDefault }) {
                selectedAddressId = defaultAddress.id
            } else {
                selectedAddressId = addresses.first?.id
            }
        } catch {
            // Ignore error, user can add new address
        }
    }

    func addAddress(title: String, city: String, district: String, street: String, building: String, apartment: String) async {
        let fullAddress = [street, building, apartment].filter { !$0.isEmpty }.joined(separator: ", ")
        let request = CreateAddressRequest(
            title: title,
            fullAddress: fullAddress.isEmpty ? city : "\(city), \(fullAddress)",
            city: city,
            district: district.isEmpty ? nil : district,
            street: street.isEmpty ? nil : street,
            building: building.isEmpty ? nil : building,
            apartment: apartment.isEmpty ? nil : apartment,
            entrance: nil,
            floor: nil,
            latitude: nil,
            longitude: nil
        )

        do {
            let address = try await userService.createAddress(request: request)
            addresses.append(address)
            selectedAddressId = address.id
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    func placeOrder(cart: Cart) async {
        isLoading = true
        defer { isLoading = false }

        var orderCart = cart
        orderCart.deliveryType = deliveryType
        orderCart.deliveryAddressId = deliveryType == .delivery ? selectedAddressId : nil

        do {
            let order = try await orderService.createOrder(
                from: orderCart,
                paymentMethod: paymentMethod,
                notes: notes.isEmpty ? nil : notes
            )
            placedOrderId = order.id
            orderPlaced = true
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}

#Preview {
    NavigationStack {
        CheckoutView(coordinator: MainCoordinator(appCoordinator: nil))
            .environmentObject(CartManager())
    }
}

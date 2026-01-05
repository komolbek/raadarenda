import SwiftUI

struct OrdersTab: View {
    @ObservedObject var coordinator: MainCoordinator

    var body: some View {
        NavigationStack(path: $coordinator.ordersPath) {
            OrdersListView(coordinator: coordinator)
                .navigationDestination(for: OrdersRoute.self) { route in
                    switch route {
                    case .detail(let order):
                        OrderDetailView(order: order, coordinator: coordinator)
                    }
                }
        }
    }
}

struct OrdersListView: View {
    @ObservedObject var coordinator: MainCoordinator
    @StateObject private var viewModel = OrdersListViewModel()

    var body: some View {
        Group {
            if !viewModel.isAuthenticated {
                NotAuthenticatedView {
                    coordinator.appCoordinator?.navigateToAuth()
                }
            } else if viewModel.isLoading && viewModel.orders.isEmpty {
                ProgressView()
            } else if viewModel.orders.isEmpty {
                EmptyOrdersView()
            } else {
                List {
                    ForEach(viewModel.orders) { order in
                        OrderRow(order: order)
                            .onTapGesture {
                                coordinator.showOrderDetail(order)
                            }
                            .onAppear {
                                if order.id == viewModel.orders.last?.id {
                                    Task { await viewModel.loadMore() }
                                }
                            }
                    }

                    if viewModel.isLoadingMore {
                        HStack {
                            Spacer()
                            ProgressView()
                            Spacer()
                        }
                    }
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle("Заказы")
        .refreshable {
            await viewModel.loadOrders()
        }
        .task {
            await viewModel.checkAuth()
            if viewModel.isAuthenticated {
                await viewModel.loadOrders()
            }
        }
    }
}

struct OrderRow: View {
    let order: Order

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Заказ #\(order.orderNumber)")
                    .font(.headline)
                Spacer()
                StatusBadge(status: order.status)
            }

            Text("\(formatDate(order.rentalStartDate)) - \(formatDate(order.rentalEndDate))")
                .font(.subheadline)
                .foregroundColor(.secondary)

            HStack {
                Text("\(order.items.count) товаров")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                Text(formatPrice(order.totalAmount))
                    .font(.subheadline)
                    .fontWeight(.semibold)
            }
        }
        .padding(.vertical, 8)
    }

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d MMM"
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

struct StatusBadge: View {
    let status: OrderStatus

    var body: some View {
        Text(status.displayName)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(backgroundColor)
            .foregroundColor(textColor)
            .cornerRadius(6)
    }

    var backgroundColor: Color {
        switch status {
        case .confirmed: return .blue.opacity(0.2)
        case .preparing: return .orange.opacity(0.2)
        case .delivered: return .green.opacity(0.2)
        case .returned: return .gray.opacity(0.2)
        case .cancelled: return .red.opacity(0.2)
        }
    }

    var textColor: Color {
        switch status {
        case .confirmed: return .blue
        case .preparing: return .orange
        case .delivered: return .green
        case .returned: return .gray
        case .cancelled: return .red
        }
    }
}

struct EmptyOrdersView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "list.clipboard")
                .font(.system(size: 60))
                .foregroundColor(.secondary)

            Text("Нет заказов")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Ваши заказы появятся здесь")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }
}

struct NotAuthenticatedView: View {
    let onLogin: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "person.crop.circle")
                .font(.system(size: 60))
                .foregroundColor(.secondary)

            Text("Войдите в аккаунт")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Чтобы видеть ваши заказы")
                .font(.subheadline)
                .foregroundColor(.secondary)

            Button("Войти", action: onLogin)
                .buttonStyle(.borderedProminent)
        }
    }
}

@MainActor
final class OrdersListViewModel: ObservableObject {
    @Published var orders: [Order] = []
    @Published var isLoading: Bool = false
    @Published var isLoadingMore: Bool = false
    @Published var isAuthenticated: Bool = false

    private let orderService: OrderServiceProtocol
    private var currentPage: Int = 1
    private var hasMore: Bool = true
    private let limit: Int = 20

    init(orderService: OrderServiceProtocol = OrderService()) {
        self.orderService = orderService
    }

    func checkAuth() async {
        isAuthenticated = await SessionManager.shared.hasValidSession()
    }

    func loadOrders() async {
        isLoading = true
        currentPage = 1

        do {
            let response = try await orderService.getOrders(page: currentPage, limit: limit, status: nil)
            orders = response.data
            hasMore = response.pagination?.hasMore ?? false
        } catch {
            // Handle error
        }

        isLoading = false
    }

    func loadMore() async {
        guard !isLoadingMore && hasMore else { return }

        isLoadingMore = true
        currentPage += 1

        do {
            let response = try await orderService.getOrders(page: currentPage, limit: limit, status: nil)
            orders.append(contentsOf: response.data)
            hasMore = response.pagination?.hasMore ?? false
        } catch {
            currentPage -= 1
        }

        isLoadingMore = false
    }
}

#Preview {
    OrdersTab(coordinator: MainCoordinator(appCoordinator: nil))
}

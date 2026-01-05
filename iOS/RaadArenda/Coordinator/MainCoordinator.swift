import SwiftUI

enum MainTab: Int, CaseIterable {
    case catalog
    case cart
    case orders
    case profile

    var title: String {
        switch self {
        case .catalog: return "Каталог"
        case .cart: return "Корзина"
        case .orders: return "Заказы"
        case .profile: return "Профиль"
        }
    }

    var icon: String {
        switch self {
        case .catalog: return "square.grid.2x2"
        case .cart: return "cart"
        case .orders: return "list.clipboard"
        case .profile: return "person"
        }
    }
}

@MainActor
final class MainCoordinator: ObservableObject {
    @Published var selectedTab: MainTab = .catalog
    @Published var catalogPath: NavigationPath = NavigationPath()
    @Published var cartPath: NavigationPath = NavigationPath()
    @Published var ordersPath: NavigationPath = NavigationPath()
    @Published var profilePath: NavigationPath = NavigationPath()

    weak var appCoordinator: AppCoordinator?

    init(appCoordinator: AppCoordinator?) {
        self.appCoordinator = appCoordinator
    }

    // MARK: - Catalog Navigation

    func showCategory(_ category: Category) {
        catalogPath.append(CatalogRoute.category(category))
    }

    func showProduct(_ product: Product) {
        catalogPath.append(CatalogRoute.product(product))
    }

    func showSearch(query: String) {
        catalogPath.append(CatalogRoute.search(query: query))
    }

    // MARK: - Cart Navigation

    func showCheckout() {
        if appCoordinator?.isAuthenticated == true {
            cartPath.append(CartRoute.checkout)
        } else {
            appCoordinator?.navigateToAuth()
        }
    }

    // MARK: - Orders Navigation

    func showOrderDetail(_ order: Order) {
        ordersPath.append(OrdersRoute.detail(order))
    }

    // MARK: - Profile Navigation

    func showAddresses() {
        profilePath.append(ProfileRoute.addresses)
    }

    func showFavorites() {
        profilePath.append(ProfileRoute.favorites)
    }

    func showCards() {
        profilePath.append(ProfileRoute.cards)
    }

    func requireAuth(for action: @escaping () -> Void) {
        if appCoordinator?.isAuthenticated == true {
            action()
        } else {
            appCoordinator?.navigateToAuth()
        }
    }
}

// MARK: - Navigation Routes

enum CatalogRoute: Hashable {
    case category(Category)
    case product(Product)
    case search(query: String)
}

enum CartRoute: Hashable {
    case checkout
    case orderConfirmation(orderId: String)
}

enum OrdersRoute: Hashable {
    case detail(Order)
}

enum ProfileRoute: Hashable {
    case addresses
    case favorites
    case editProfile
    case cards
}

// MARK: - Main Coordinator View

struct MainCoordinatorView: View {
    @StateObject private var coordinator: MainCoordinator
    @StateObject private var cartManager = CartManager()
    @StateObject private var favoritesManager = FavoritesManager()
    private let appCoordinator: AppCoordinator

    init(appCoordinator: AppCoordinator) {
        self.appCoordinator = appCoordinator
        _coordinator = StateObject(wrappedValue: MainCoordinator(appCoordinator: appCoordinator))
    }

    var body: some View {
        TabView(selection: $coordinator.selectedTab) {
            CatalogTab(coordinator: coordinator)
                .tabItem {
                    Label(MainTab.catalog.title, systemImage: MainTab.catalog.icon)
                }
                .tag(MainTab.catalog)

            CartTab(coordinator: coordinator)
                .tabItem {
                    Label(MainTab.cart.title, systemImage: MainTab.cart.icon)
                }
                .tag(MainTab.cart)
                .badge(cartManager.itemCount)

            OrdersTab(coordinator: coordinator)
                .tabItem {
                    Label(MainTab.orders.title, systemImage: MainTab.orders.icon)
                }
                .tag(MainTab.orders)

            ProfileTab(coordinator: coordinator)
                .tabItem {
                    Label(MainTab.profile.title, systemImage: MainTab.profile.icon)
                }
                .tag(MainTab.profile)
        }
        .environmentObject(coordinator)
        .environmentObject(cartManager)
        .environmentObject(favoritesManager)
        .environmentObject(appCoordinator)
    }
}

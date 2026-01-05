import SwiftUI

struct ProductDetailView: View {
    let product: Product
    @ObservedObject var coordinator: MainCoordinator
    @StateObject private var viewModel: ProductDetailViewModel
    @EnvironmentObject var cartManager: CartManager
    @EnvironmentObject var favoritesManager: FavoritesManager

    init(product: Product, coordinator: MainCoordinator) {
        self.product = product
        self.coordinator = coordinator
        _viewModel = StateObject(wrappedValue: ProductDetailViewModel(product: product))
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Image Gallery
                TabView {
                    ForEach(product.photos, id: \.self) { photo in
                        AsyncImage(url: URL(string: photo)) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fit)
                        } placeholder: {
                            Rectangle()
                                .fill(Color(.systemGray5))
                                .overlay {
                                    ProgressView()
                                }
                        }
                    }
                }
                .frame(height: 300)
                .tabViewStyle(.page)
                .indexViewStyle(.page(backgroundDisplayMode: .always))

                VStack(alignment: .leading, spacing: 20) {
                    // Title & Price
                    VStack(alignment: .leading, spacing: 8) {
                        Text(product.name)
                            .font(.title2)
                            .fontWeight(.bold)

                        HStack(alignment: .firstTextBaseline) {
                            Text(viewModel.formatPrice(product.dailyPrice))
                                .font(.title)
                                .fontWeight(.bold)
                                .foregroundColor(.accentColor)

                            Text("/ день")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }

                    Divider()

                    // Date Picker
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Даты аренды")
                            .font(.headline)

                        HStack(spacing: 16) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Начало")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                DatePicker("", selection: $viewModel.startDate, in: Date()..., displayedComponents: .date)
                                    .labelsHidden()
                            }

                            VStack(alignment: .leading, spacing: 4) {
                                Text("Конец")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                DatePicker("", selection: $viewModel.endDate, in: viewModel.startDate..., displayedComponents: .date)
                                    .labelsHidden()
                            }
                        }

                        Text("\(viewModel.rentalDays) дней")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }

                    // Quantity
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Количество")
                                .font(.headline)

                            Spacer()

                            if let availability = viewModel.availability {
                                Text("Доступно: \(availability.availableQuantity)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }

                        HStack {
                            Button {
                                viewModel.decrementQuantity()
                            } label: {
                                Image(systemName: "minus")
                                    .frame(width: 44, height: 44)
                                    .background(Color(.systemGray6))
                                    .cornerRadius(8)
                            }
                            .disabled(viewModel.quantity <= 1)

                            Text("\(viewModel.quantity)")
                                .font(.title3)
                                .fontWeight(.semibold)
                                .frame(width: 60)

                            Button {
                                viewModel.incrementQuantity()
                            } label: {
                                Image(systemName: "plus")
                                    .frame(width: 44, height: 44)
                                    .background(Color(.systemGray6))
                                    .cornerRadius(8)
                            }
                            .disabled(viewModel.quantity >= viewModel.maxQuantity)
                        }
                    }

                    Divider()

                    // Price Summary
                    VStack(spacing: 8) {
                        HStack {
                            Text("Итого за \(viewModel.rentalDays) дней")
                                .foregroundColor(.secondary)
                            Spacer()
                            Text(viewModel.formatPrice(viewModel.totalPrice))
                                .fontWeight(.semibold)
                        }

                        if viewModel.savings > 0 {
                            HStack {
                                Text("Экономия")
                                    .foregroundColor(.green)
                                Spacer()
                                Text("-\(viewModel.formatPrice(viewModel.savings)) (\(viewModel.savingsPercentage)%)")
                                    .foregroundColor(.green)
                                    .fontWeight(.medium)
                            }
                        }
                    }
                    .font(.subheadline)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)

                    // Description
                    if let description = product.description, !description.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Описание")
                                .font(.headline)
                            Text(description)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }

                    // Specifications
                    if let specs = product.specifications {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Характеристики")
                                .font(.headline)

                            SpecificationRow(title: "Ширина", value: specs.width)
                            SpecificationRow(title: "Высота", value: specs.height)
                            SpecificationRow(title: "Глубина", value: specs.depth)
                            SpecificationRow(title: "Вес", value: specs.weight)
                            SpecificationRow(title: "Цвет", value: specs.color)
                            SpecificationRow(title: "Материал", value: specs.material)
                        }
                    }
                }
                .padding()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    Task {
                        await favoritesManager.toggleFavorite(product)
                    }
                } label: {
                    Image(systemName: favoritesManager.isFavorite(product.id) ? "heart.fill" : "heart")
                        .foregroundColor(favoritesManager.isFavorite(product.id) ? .red : .primary)
                }
            }
        }
        .safeAreaInset(edge: .bottom) {
            VStack(spacing: 8) {
                if viewModel.isProductUnavailable, let message = viewModel.unavailableMessage {
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.orange)
                        Text(message)
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.horizontal)
                }

                Button {
                    cartManager.addItem(
                        product,
                        quantity: viewModel.quantity,
                        startDate: viewModel.startDate,
                        endDate: viewModel.endDate
                    )
                    viewModel.showAddedToCart = true
                } label: {
                    HStack {
                        Image(systemName: viewModel.canAddToCart ? "cart.badge.plus" : "xmark.circle")
                        Text(viewModel.canAddToCart ? "В корзину" : "Недоступно")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(viewModel.canAddToCart ? Color.accentColor : Color.gray)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .disabled(!viewModel.canAddToCart)
                .padding(.horizontal)
            }
            .padding(.vertical)
            .background(.ultraThinMaterial)
        }
        .alert("Добавлено в корзину", isPresented: $viewModel.showAddedToCart) {
            Button("Продолжить покупки", role: .cancel) {}
            Button("Перейти в корзину") {
                coordinator.selectedTab = .cart
            }
        }
        .task {
            await viewModel.checkAvailability()
        }
        .onChange(of: viewModel.startDate) { _, _ in
            Task { await viewModel.checkAvailability() }
        }
        .onChange(of: viewModel.endDate) { _, _ in
            Task { await viewModel.checkAvailability() }
        }
    }
}

struct SpecificationRow: View {
    let title: String
    let value: String?

    var body: some View {
        if let value = value, !value.isEmpty {
            HStack {
                Text(title)
                    .foregroundColor(.secondary)
                Spacer()
                Text(value)
            }
            .font(.subheadline)
        }
    }
}

@MainActor
final class ProductDetailViewModel: ObservableObject {
    @Published var quantity: Int = 1
    @Published var startDate: Date = Date()
    @Published var endDate: Date = Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()
    @Published var availability: ProductAvailability?
    @Published var isCheckingAvailability: Bool = false
    @Published var showAddedToCart: Bool = false
    @Published var isProductUnavailable: Bool = false
    @Published var unavailableMessage: String?

    private let product: Product
    private let catalogService: CatalogServiceProtocol

    init(product: Product, catalogService: CatalogServiceProtocol = CatalogService()) {
        self.product = product
        self.catalogService = catalogService
    }

    var canAddToCart: Bool {
        !isProductUnavailable && maxQuantity > 0
    }

    var rentalDays: Int {
        max(1, Calendar.current.dateComponents([.day], from: startDate, to: endDate).day ?? 1)
    }

    var maxQuantity: Int {
        min(availability?.availableQuantity ?? product.totalStock, product.totalStock)
    }

    var totalPrice: Int {
        // Single day - use quantity pricing
        if rentalDays == 1 {
            if let tier = product.quantityPricing.first(where: { $0.quantity == quantity }) {
                return tier.totalPrice
            }
            return product.dailyPrice * quantity
        }

        // Multiple days - use day pricing
        if let tier = product.pricingTiers.first(where: { $0.days == rentalDays }) {
            return tier.totalPrice * quantity
        }

        // Fallback
        return product.dailyPrice * rentalDays * quantity
    }

    var fullPrice: Int {
        product.dailyPrice * rentalDays * quantity
    }

    var savings: Int {
        fullPrice - totalPrice
    }

    var savingsPercentage: Int {
        guard fullPrice > 0 else { return 0 }
        return Int((Double(savings) / Double(fullPrice)) * 100)
    }

    func incrementQuantity() {
        if quantity < maxQuantity {
            quantity += 1
        }
    }

    func decrementQuantity() {
        if quantity > 1 {
            quantity -= 1
        }
    }

    func checkAvailability() async {
        isCheckingAvailability = true
        isProductUnavailable = false
        unavailableMessage = nil

        do {
            availability = try await catalogService.checkAvailability(
                productId: product.id,
                startDate: startDate,
                endDate: endDate
            )

            if let avail = availability, avail.availableQuantity == 0 {
                isProductUnavailable = true
                unavailableMessage = "Товар недоступен на выбранные даты"
            } else if quantity > maxQuantity {
                quantity = max(1, maxQuantity)
            }
        } catch let error as NetworkError {
            switch error {
            case .serverError(404, _):
                isProductUnavailable = true
                unavailableMessage = "Товар больше недоступен"
            case .serverError(_, let message):
                isProductUnavailable = true
                unavailableMessage = message
            default:
                // Use total stock as fallback
                break
            }
        } catch {
            // Use total stock as fallback
        }

        isCheckingAvailability = false
    }

    func formatPrice(_ price: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = " "
        return "\(formatter.string(from: NSNumber(value: price)) ?? "\(price)") сум"
    }
}

#Preview {
    NavigationStack {
        ProductDetailView(
            product: Product(
                id: "1",
                name: "Кресло свадебное",
                description: "Красивое кресло для свадебных церемоний",
                categoryId: "1",
                photos: [],
                specifications: ProductSpecifications(
                    width: "60 см",
                    height: "100 см",
                    depth: "50 см",
                    weight: "5 кг",
                    color: "Белый",
                    material: "Дерево"
                ),
                dailyPrice: 50000,
                pricingTiers: [
                    PricingTier(days: 2, totalPrice: 80000),
                    PricingTier(days: 3, totalPrice: 100000)
                ],
                quantityPricing: [
                    QuantityPricing(quantity: 2, totalPrice: 90000)
                ],
                totalStock: 10,
                isActive: true,
                createdAt: Date()
            ),
            coordinator: MainCoordinator(appCoordinator: nil)
        )
        .environmentObject(CartManager())
        .environmentObject(FavoritesManager())
    }
}

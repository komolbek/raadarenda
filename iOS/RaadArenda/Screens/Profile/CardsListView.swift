import SwiftUI

struct CardsListView: View {
    @ObservedObject var coordinator: MainCoordinator
    @StateObject private var viewModel = CardsViewModel()
    @State private var showAddCard = false

    var body: some View {
        List {
            if viewModel.isLoading && viewModel.cards.isEmpty {
                HStack {
                    Spacer()
                    ProgressView()
                    Spacer()
                }
                .listRowBackground(Color.clear)
            } else if viewModel.cards.isEmpty {
                Section {
                    VStack(spacing: 16) {
                        Image(systemName: "creditcard")
                            .font(.system(size: 50))
                            .foregroundColor(.secondary)

                        Text("Нет сохранённых карт")
                            .font(.headline)

                        Text("Добавьте карту для быстрой оплаты")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 40)
                }
                .listRowBackground(Color.clear)
            } else {
                ForEach(viewModel.cards) { card in
                    CardRow(
                        card: card,
                        onSetDefault: {
                            Task { await viewModel.setDefault(cardId: card.id) }
                        },
                        onDelete: {
                            Task { await viewModel.deleteCard(cardId: card.id) }
                        }
                    )
                }
            }
        }
        .navigationTitle("Мои карты")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    showAddCard = true
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(isPresented: $showAddCard) {
            AddCardView(onAdded: { card in
                viewModel.cards.insert(card, at: 0)
            })
        }
        .task {
            await viewModel.loadCards()
        }
    }
}

struct CardRow: View {
    let card: Card
    var onSetDefault: () -> Void
    var onDelete: () -> Void

    var body: some View {
        HStack(spacing: 16) {
            // Card Icon
            Image(systemName: cardIcon(for: card.cardType))
                .font(.title)
                .foregroundColor(cardColor(for: card.cardType))
                .frame(width: 44)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(card.cardNumber)
                        .font(.headline)

                    if card.isDefault {
                        Text("Основная")
                            .font(.caption)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.accentColor.opacity(0.1))
                            .foregroundColor(.accentColor)
                            .cornerRadius(4)
                    }
                }

                Text("\(card.cardHolder) • \(card.expiryString)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            Spacer()
        }
        .padding(.vertical, 8)
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            Button(role: .destructive) {
                onDelete()
            } label: {
                Label("Удалить", systemImage: "trash")
            }

            if !card.isDefault {
                Button {
                    onSetDefault()
                } label: {
                    Label("По умолчанию", systemImage: "star")
                }
                .tint(.orange)
            }
        }
    }

    private func cardIcon(for type: String) -> String {
        switch type {
        case "visa":
            return "creditcard.fill"
        case "mastercard":
            return "creditcard.fill"
        case "humo":
            return "creditcard.fill"
        case "uzcard":
            return "creditcard.fill"
        default:
            return "creditcard"
        }
    }

    private func cardColor(for type: String) -> Color {
        switch type {
        case "visa":
            return .blue
        case "mastercard":
            return .orange
        case "humo":
            return .green
        case "uzcard":
            return .teal
        default:
            return .gray
        }
    }
}

struct AddCardView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = AddCardViewModel()
    var onAdded: (Card) -> Void

    var body: some View {
        NavigationStack {
            Form {
                Section("Данные карты") {
                    TextField("Номер карты", text: $viewModel.cardNumber)
                        .keyboardType(.numberPad)
                        .onChange(of: viewModel.cardNumber) { _, newValue in
                            viewModel.cardNumber = formatCardNumber(newValue)
                        }

                    TextField("Имя владельца", text: $viewModel.cardHolder)
                        .textInputAutocapitalization(.characters)

                    HStack {
                        TextField("ММ", text: $viewModel.expiryMonth)
                            .keyboardType(.numberPad)
                            .frame(width: 60)
                            .multilineTextAlignment(.center)

                        Text("/")

                        TextField("ГГ", text: $viewModel.expiryYear)
                            .keyboardType(.numberPad)
                            .frame(width: 60)
                            .multilineTextAlignment(.center)

                        Spacer()
                    }
                }

                Section {
                    Button {
                        Task {
                            if let card = await viewModel.addCard() {
                                onAdded(card)
                                dismiss()
                            }
                        }
                    } label: {
                        HStack {
                            Spacer()
                            if viewModel.isLoading {
                                ProgressView()
                            } else {
                                Text("Добавить карту")
                            }
                            Spacer()
                        }
                    }
                    .disabled(!viewModel.isValid || viewModel.isLoading)
                }

                if let error = viewModel.errorMessage {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("Новая карта")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Отмена") {
                        dismiss()
                    }
                }
            }
        }
        .presentationDetents([.medium])
    }

    private func formatCardNumber(_ input: String) -> String {
        let cleaned = input.replacingOccurrences(of: " ", with: "")
        let digits = cleaned.filter { $0.isNumber }
        let limited = String(digits.prefix(16))

        var formatted = ""
        for (index, char) in limited.enumerated() {
            if index > 0 && index % 4 == 0 {
                formatted += " "
            }
            formatted.append(char)
        }
        return formatted
    }
}

@MainActor
final class CardsViewModel: ObservableObject {
    @Published var cards: [Card] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let userService: UserServiceProtocol

    init(userService: UserServiceProtocol = UserService()) {
        self.userService = userService
    }

    func loadCards() async {
        isLoading = true
        errorMessage = nil

        do {
            cards = try await userService.getCards()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func deleteCard(cardId: String) async {
        do {
            try await userService.deleteCard(id: cardId)
            cards.removeAll { $0.id == cardId }

            // If deleted card was default, update remaining cards
            if let firstCard = cards.first, !cards.contains(where: { $0.isDefault }) {
                await loadCards()
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func setDefault(cardId: String) async {
        do {
            _ = try await userService.setDefaultCard(id: cardId)
            await loadCards()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

@MainActor
final class AddCardViewModel: ObservableObject {
    @Published var cardNumber: String = ""
    @Published var cardHolder: String = ""
    @Published var expiryMonth: String = ""
    @Published var expiryYear: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let userService: UserServiceProtocol

    init(userService: UserServiceProtocol = UserService()) {
        self.userService = userService
    }

    var isValid: Bool {
        let cleanedNumber = cardNumber.replacingOccurrences(of: " ", with: "")
        return cleanedNumber.count >= 13 &&
               !cardHolder.isEmpty &&
               (Int(expiryMonth) ?? 0) >= 1 && (Int(expiryMonth) ?? 0) <= 12 &&
               (Int(expiryYear) ?? 0) >= 24 && (Int(expiryYear) ?? 0) <= 99
    }

    func addCard() async -> Card? {
        guard isValid else { return nil }

        isLoading = true
        errorMessage = nil

        do {
            let request = AddCardRequest(
                cardNumber: cardNumber.replacingOccurrences(of: " ", with: ""),
                cardHolder: cardHolder,
                expiryMonth: Int(expiryMonth) ?? 0,
                expiryYear: Int(expiryYear) ?? 0
            )
            let card = try await userService.addCard(request: request)
            isLoading = false
            return card
        } catch {
            errorMessage = error.localizedDescription
            isLoading = false
            return nil
        }
    }
}

#Preview {
    NavigationStack {
        CardsListView(coordinator: MainCoordinator(appCoordinator: nil))
    }
}

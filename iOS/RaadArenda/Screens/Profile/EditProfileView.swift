import SwiftUI

struct EditProfileView: View {
    @ObservedObject var coordinator: MainCoordinator
    @StateObject private var viewModel = EditProfileViewModel()
    @Environment(\.dismiss) var dismiss

    var body: some View {
        Form {
            Section("Имя") {
                TextField("Ваше имя", text: $viewModel.name)
            }

            Section("Телефон") {
                Text(viewModel.phoneNumber)
                    .foregroundColor(.secondary)
            }
        }
        .navigationTitle("Редактировать профиль")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button("Сохранить") {
                    Task {
                        if await viewModel.saveProfile() {
                            dismiss()
                        }
                    }
                }
                .disabled(viewModel.name.isEmpty || viewModel.isLoading)
            }
        }
        .alert("Ошибка", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(viewModel.errorMessage)
        }
        .task {
            await viewModel.loadProfile()
        }
    }
}

@MainActor
final class EditProfileViewModel: ObservableObject {
    @Published var name: String = ""
    @Published var phoneNumber: String = ""
    @Published var isLoading: Bool = false
    @Published var showError: Bool = false
    @Published var errorMessage: String = ""

    private let userService: UserServiceProtocol

    init(userService: UserServiceProtocol = UserService()) {
        self.userService = userService
    }

    func loadProfile() async {
        do {
            let user = try await userService.getProfile()
            name = user.name ?? ""
            phoneNumber = user.phoneNumber
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    func saveProfile() async -> Bool {
        isLoading = true
        defer { isLoading = false }

        do {
            _ = try await userService.updateProfile(name: name)
            return true
        } catch {
            errorMessage = error.localizedDescription
            showError = true
            return false
        }
    }
}

#Preview {
    NavigationStack {
        EditProfileView(coordinator: MainCoordinator(appCoordinator: nil))
    }
}

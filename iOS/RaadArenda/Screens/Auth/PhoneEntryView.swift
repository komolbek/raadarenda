import SwiftUI

struct PhoneEntryView: View {
    @StateObject private var viewModel: PhoneEntryViewModel
    @ObservedObject var coordinator: AuthCoordinator

    init(coordinator: AuthCoordinator) {
        self.coordinator = coordinator
        _viewModel = StateObject(wrappedValue: PhoneEntryViewModel())
    }

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Header
            VStack(spacing: 8) {
                Image(systemName: "phone.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.accentColor)

                Text("Вход в аккаунт")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Введите номер телефона для получения кода")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }

            // Phone Input
            VStack(alignment: .leading, spacing: 8) {
                Text("Номер телефона")
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                HStack(spacing: 12) {
                    Text("+998")
                        .font(.title3)
                        .fontWeight(.medium)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .background(Color(.systemGray6))
                        .cornerRadius(12)

                    TextField("90 123 45 67", text: $viewModel.phoneNumber)
                        .font(.title3)
                        .keyboardType(.numberPad)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                        .onChange(of: viewModel.phoneNumber) { _, newValue in
                            viewModel.formatPhoneNumber(newValue)
                        }
                }

                if let error = viewModel.validationError {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                }
            }
            .padding(.horizontal)

            Spacer()

            // Continue Button
            Button {
                Task {
                    if await viewModel.sendOTP() {
                        coordinator.showOTPVerification(phoneNumber: viewModel.fullPhoneNumber)
                    }
                }
            } label: {
                HStack {
                    if viewModel.isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Продолжить")
                            .fontWeight(.semibold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(viewModel.isValid ? Color.accentColor : Color.gray)
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            .disabled(!viewModel.isValid || viewModel.isLoading)
            .padding(.horizontal)

            // Skip Button
            Button {
                coordinator.dismiss()
            } label: {
                Text("Пропустить")
                    .foregroundColor(.secondary)
            }
            .padding(.bottom)
        }
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button {
                    coordinator.dismiss()
                } label: {
                    Image(systemName: "xmark")
                        .foregroundColor(.primary)
                }
            }
        }
        .alert("Ошибка", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(viewModel.errorMessage)
        }
    }
}

@MainActor
final class PhoneEntryViewModel: ObservableObject {
    @Published var phoneNumber: String = ""
    @Published var isLoading: Bool = false
    @Published var showError: Bool = false
    @Published var errorMessage: String = ""
    @Published var validationError: String?

    private let authService: AuthServiceProtocol

    init(authService: AuthServiceProtocol = AuthService()) {
        self.authService = authService
    }

    var isValid: Bool {
        let digits = phoneNumber.filter { $0.isNumber }
        return digits.count == 9
    }

    var fullPhoneNumber: String {
        let digits = phoneNumber.filter { $0.isNumber }
        return "+998\(digits)"
    }

    func formatPhoneNumber(_ value: String) {
        let digits = value.filter { $0.isNumber }
        if digits.count > 9 {
            phoneNumber = String(digits.prefix(9))
        } else {
            phoneNumber = digits
        }
        validationError = nil
    }

    func sendOTP() async -> Bool {
        guard isValid else {
            validationError = "Введите 9 цифр номера"
            return false
        }

        isLoading = true
        defer { isLoading = false }

        do {
            let response = try await authService.sendOTP(phoneNumber: fullPhoneNumber)
            if response.success {
                return true
            } else {
                errorMessage = response.message
                showError = true
                return false
            }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
            return false
        }
    }
}

#Preview {
    NavigationStack {
        PhoneEntryView(coordinator: AuthCoordinator(appCoordinator: nil))
    }
}

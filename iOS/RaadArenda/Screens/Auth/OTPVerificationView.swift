import SwiftUI

struct OTPVerificationView: View {
    let phoneNumber: String
    @ObservedObject var coordinator: AuthCoordinator
    @StateObject private var viewModel: OTPVerificationViewModel
    @FocusState private var isTextFieldFocused: Bool

    init(phoneNumber: String, coordinator: AuthCoordinator) {
        self.phoneNumber = phoneNumber
        self.coordinator = coordinator
        _viewModel = StateObject(wrappedValue: OTPVerificationViewModel(phoneNumber: phoneNumber))
    }

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Header
            VStack(spacing: 8) {
                Image(systemName: "lock.shield.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.accentColor)

                Text("Введите код")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Код отправлен на \(phoneNumber)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            // OTP Input
            ZStack {
                // Hidden TextField for input
                TextField("", text: $viewModel.code)
                    .keyboardType(.numberPad)
                    .textContentType(.oneTimeCode)
                    .focused($isTextFieldFocused)
                    .opacity(0.001)
                    .onChange(of: viewModel.code) { _, newValue in
                        viewModel.handleCodeChange(newValue)
                    }

                // Visual OTP boxes
                HStack(spacing: 12) {
                    ForEach(0..<6, id: \.self) { index in
                        OTPDigitView(
                            digit: viewModel.digit(at: index),
                            isFocused: isTextFieldFocused && viewModel.focusedIndex == index
                        )
                    }
                }
                .contentShape(Rectangle())
                .onTapGesture {
                    isTextFieldFocused = true
                }
            }

            if let error = viewModel.validationError {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.red)
            }

            // Resend Button
            HStack {
                if viewModel.canResend {
                    Button("Отправить повторно") {
                        Task {
                            await viewModel.resendOTP()
                        }
                    }
                    .foregroundColor(.accentColor)
                } else {
                    Text("Отправить повторно через \(viewModel.resendCountdown) сек")
                        .foregroundColor(.secondary)
                }
            }
            .font(.subheadline)

            Spacer()

            // Verify Button
            Button {
                Task {
                    if await viewModel.verifyOTP() {
                        coordinator.onAuthSuccess()
                    }
                }
            } label: {
                HStack {
                    if viewModel.isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Подтвердить")
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
            .padding(.bottom)
        }
        .alert("Ошибка", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(viewModel.errorMessage)
        }
        .onAppear {
            isTextFieldFocused = true
        }
    }
}

struct OTPDigitView: View {
    let digit: String
    let isFocused: Bool

    var body: some View {
        Text(digit)
            .font(.title)
            .fontWeight(.semibold)
            .frame(width: 45, height: 55)
            .background(Color(.systemGray6))
            .cornerRadius(10)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(isFocused ? Color.accentColor : Color.clear, lineWidth: 2)
            )
    }
}

@MainActor
final class OTPVerificationViewModel: ObservableObject {
    @Published var code: String = ""
    @Published var isLoading: Bool = false
    @Published var showError: Bool = false
    @Published var errorMessage: String = ""
    @Published var validationError: String?
    @Published var resendCountdown: Int = 60
    @Published var canResend: Bool = false
    @Published var focusedIndex: Int = 0

    private let phoneNumber: String
    private let authService: AuthServiceProtocol
    private var timer: Timer?

    init(phoneNumber: String, authService: AuthServiceProtocol = AuthService()) {
        self.phoneNumber = phoneNumber
        self.authService = authService
        startResendTimer()
    }

    var isValid: Bool {
        code.count == 6
    }

    func digit(at index: Int) -> String {
        guard index < code.count else { return "" }
        let stringIndex = code.index(code.startIndex, offsetBy: index)
        return String(code[stringIndex])
    }

    func handleCodeChange(_ newValue: String) {
        let filtered = newValue.filter { $0.isNumber }
        if filtered.count <= 6 {
            code = filtered
            focusedIndex = min(filtered.count, 5)
        } else {
            code = String(filtered.prefix(6))
        }
        validationError = nil
    }

    func verifyOTP() async -> Bool {
        guard isValid else {
            validationError = "Введите 6-значный код"
            return false
        }

        isLoading = true
        defer { isLoading = false }

        do {
            let response = try await authService.verifyOTP(phoneNumber: phoneNumber, code: code)
            if response.success, let authData = response.data {
                await SessionManager.shared.saveSession(
                    token: authData.sessionToken,
                    userId: authData.user.id
                )
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

    func resendOTP() async {
        do {
            let response = try await authService.sendOTP(phoneNumber: phoneNumber)
            if response.success {
                canResend = false
                resendCountdown = 60
                startResendTimer()
            } else {
                errorMessage = response.message
                showError = true
            }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    private func startResendTimer() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                guard let self = self else { return }
                if self.resendCountdown > 0 {
                    self.resendCountdown -= 1
                } else {
                    self.canResend = true
                    self.timer?.invalidate()
                }
            }
        }
    }

    deinit {
        timer?.invalidate()
    }
}

#Preview {
    OTPVerificationView(
        phoneNumber: "+998901234567",
        coordinator: AuthCoordinator(appCoordinator: nil)
    )
}

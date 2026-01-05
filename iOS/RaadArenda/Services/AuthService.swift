import Foundation

protocol AuthServiceProtocol {
    func sendOTP(phoneNumber: String) async throws -> SendOTPResponse
    func verifyOTP(phoneNumber: String, code: String) async throws -> VerifyOTPResponse
    func logout() async throws
}

final class AuthService: AuthServiceProtocol {
    private let networkManager: NetworkManager

    init(networkManager: NetworkManager = .shared) {
        self.networkManager = networkManager
    }

    func sendOTP(phoneNumber: String) async throws -> SendOTPResponse {
        let endpoint = AuthEndpoint.sendOTP(phoneNumber: phoneNumber)
        return try await networkManager.request(endpoint)
    }

    func verifyOTP(phoneNumber: String, code: String) async throws -> VerifyOTPResponse {
        let deviceId = await getDeviceId()
        let endpoint = AuthEndpoint.verifyOTP(phoneNumber: phoneNumber, code: code, deviceId: deviceId)
        return try await networkManager.request(endpoint)
    }

    func logout() async throws {
        let endpoint = AuthEndpoint.logout
        let _: SendOTPResponse = try await networkManager.request(endpoint)
        await SessionManager.shared.clearSession()
    }

    private func getDeviceId() async -> String {
        if let existingId = UserDefaults.standard.string(forKey: "device_id") {
            return existingId
        }
        let newId = UUID().uuidString
        UserDefaults.standard.set(newId, forKey: "device_id")
        return newId
    }
}

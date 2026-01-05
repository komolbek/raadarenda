import Foundation
import Security

// MARK: - Session Manager (Actor for thread safety)

actor SessionManager {
    static let shared = SessionManager()

    private let keychainService = "com.raadarenda.ios"
    private let sessionTokenKey = "session_token"
    private let userIdKey = "user_id"

    private var cachedToken: String?
    private var cachedUserId: String?
    private var isInitialized = false

    private init() {
        // Defer keychain loading to avoid actor isolation warnings
    }

    // MARK: - Private Initialization

    private func ensureInitialized() {
        guard !isInitialized else { return }
        cachedToken = loadFromKeychainSync(key: sessionTokenKey)
        cachedUserId = loadFromKeychainSync(key: userIdKey)
        isInitialized = true
    }

    // MARK: - Public Methods

    func saveSession(token: String, userId: String) {
        cachedToken = token
        cachedUserId = userId
        saveToKeychain(key: sessionTokenKey, value: token)
        saveToKeychain(key: userIdKey, value: userId)
    }

    func getSessionToken() -> String? {
        ensureInitialized()
        return cachedToken
    }

    func getUserId() -> String? {
        ensureInitialized()
        return cachedUserId
    }

    func hasValidSession() -> Bool {
        ensureInitialized()
        return cachedToken != nil && cachedUserId != nil
    }

    func clearSession() {
        cachedToken = nil
        cachedUserId = nil
        deleteFromKeychain(key: sessionTokenKey)
        deleteFromKeychain(key: userIdKey)
    }

    // MARK: - Keychain Helpers

    private func saveToKeychain(key: String, value: String) {
        guard let data = value.data(using: .utf8) else { return }

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: key
        ]

        // Delete existing item
        SecItemDelete(query as CFDictionary)

        // Add new item
        var newQuery = query
        newQuery[kSecValueData as String] = data

        SecItemAdd(newQuery as CFDictionary, nil)
    }

    private nonisolated func loadFromKeychainSync(key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let value = String(data: data, encoding: .utf8) else {
            return nil
        }

        return value
    }

    private func deleteFromKeychain(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: keychainService,
            kSecAttrAccount as String: key
        ]

        SecItemDelete(query as CFDictionary)
    }
}

// MARK: - UI Session Manager (MainActor for UI binding)

@MainActor
final class UISessionManager: ObservableObject {
    static let shared = UISessionManager()

    @Published private(set) var isAuthenticated: Bool = false
    @Published private(set) var currentUser: User?

    private init() {
        Task {
            await checkAuthState()
        }
    }

    func checkAuthState() async {
        isAuthenticated = await SessionManager.shared.hasValidSession()
    }

    func onLogin(user: User, token: String) async {
        await SessionManager.shared.saveSession(token: token, userId: user.id)
        currentUser = user
        isAuthenticated = true
    }

    func logout() async {
        await SessionManager.shared.clearSession()
        currentUser = nil
        isAuthenticated = false
    }
}

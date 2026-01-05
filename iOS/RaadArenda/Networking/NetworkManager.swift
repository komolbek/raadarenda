import Foundation

// MARK: - Network Error

enum NetworkError: LocalizedError {
    case invalidURL
    case noData
    case decodingError(Error)
    case serverError(Int, String)
    case unauthorized
    case networkError(Error)
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Неверный URL"
        case .noData:
            return "Нет данных"
        case .decodingError(let error):
            return "Ошибка декодирования: \(error.localizedDescription)"
        case .serverError(let code, let message):
            return "Ошибка сервера (\(code)): \(message)"
        case .unauthorized:
            return "Необходима авторизация"
        case .networkError(let error):
            return "Ошибка сети: \(error.localizedDescription)"
        case .unknown:
            return "Неизвестная ошибка"
        }
    }
}

// MARK: - HTTP Method

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case patch = "PATCH"
    case delete = "DELETE"
}

// MARK: - API Endpoint Protocol

protocol APIEndpoint {
    var path: String { get }
    var method: HTTPMethod { get }
    var headers: [String: String] { get }
    var queryParams: [String: String] { get }
    var body: Encodable? { get }
    var requiresAuth: Bool { get }
}

extension APIEndpoint {
    var headers: [String: String] { [:] }
    var queryParams: [String: String] { [:] }
    var body: Encodable? { nil }
    var requiresAuth: Bool { false }
}

// MARK: - Network Manager

actor NetworkManager {
    static let shared = NetworkManager()

    private let baseURL: String
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    private init() {
        #if DEBUG
        self.baseURL = "http://localhost:3000/api"
        #else
        self.baseURL = "https://api.raadarenda.uz/api"
        #endif

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)

        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .iso8601

        self.encoder = JSONEncoder()
        self.encoder.dateEncodingStrategy = .iso8601
    }

    func request<T: Decodable>(_ endpoint: APIEndpoint) async throws -> T {
        let request = try await buildRequest(for: endpoint)

        #if DEBUG
        logRequest(request, body: endpoint.body)
        #endif

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.unknown
        }

        #if DEBUG
        logResponse(httpResponse, data: data)
        #endif

        switch httpResponse.statusCode {
        case 200...299:
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                throw NetworkError.decodingError(error)
            }
        case 401:
            await SessionManager.shared.clearSession()
            throw NetworkError.unauthorized
        default:
            if let errorResponse = try? decoder.decode(APIErrorResponse.self, from: data) {
                throw NetworkError.serverError(httpResponse.statusCode, errorResponse.message)
            }
            throw NetworkError.serverError(httpResponse.statusCode, "Произошла ошибка")
        }
    }

    private func buildRequest(for endpoint: APIEndpoint) async throws -> URLRequest {
        var urlString = baseURL + endpoint.path

        if !endpoint.queryParams.isEmpty {
            let queryString = endpoint.queryParams
                .map { "\($0.key)=\($0.value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? $0.value)" }
                .joined(separator: "&")
            urlString += "?\(queryString)"
        }

        guard let url = URL(string: urlString) else {
            throw NetworkError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue

        // Default headers
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("ru", forHTTPHeaderField: "x-language")

        // Custom headers
        for (key, value) in endpoint.headers {
            request.setValue(value, forHTTPHeaderField: key)
        }

        // Auth header
        if endpoint.requiresAuth {
            if let token = await SessionManager.shared.getSessionToken() {
                request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            }
        }

        // Body
        if let body = endpoint.body {
            request.httpBody = try encoder.encode(AnyEncodable(body))
        }

        return request
    }

    // MARK: - Logging

    private func logRequest(_ request: URLRequest, body: Encodable?) {
        print("🌐 REQUEST: \(request.httpMethod ?? "?") \(request.url?.absoluteString ?? "?")")
        if let body = body {
            if let data = try? encoder.encode(AnyEncodable(body)),
               let json = String(data: data, encoding: .utf8) {
                print("📤 BODY: \(json)")
            }
        }
    }

    private func logResponse(_ response: HTTPURLResponse, data: Data) {
        let statusEmoji = (200...299).contains(response.statusCode) ? "✅" : "❌"
        print("\(statusEmoji) RESPONSE: \(response.statusCode)")
        if let json = String(data: data, encoding: .utf8) {
            print("📥 DATA: \(json.prefix(500))")
        }
    }
}

// MARK: - Type Erased Encodable

struct AnyEncodable: Encodable {
    private let _encode: (Encoder) throws -> Void

    init<T: Encodable>(_ value: T) {
        _encode = value.encode
    }

    func encode(to encoder: Encoder) throws {
        try _encode(encoder)
    }
}

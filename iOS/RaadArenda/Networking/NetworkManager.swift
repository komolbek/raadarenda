import Foundation

actor NetworkManager {
    static let shared = NetworkManager()

    private let baseURL: String
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    private init() {
        #if DEBUG
        self.baseURL = "http://192.168.1.111:3000/api"
        #else
        self.baseURL = "https://api.raadarenda.uz/api"
        #endif

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 60
        self.session = URLSession(configuration: config)

        self.decoder = JSONDecoder()
        self.decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let dateString = try container.decode(String.self)

            // Try ISO8601 with fractional seconds first
            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = formatter.date(from: dateString) {
                return date
            }

            // Fallback to standard ISO8601
            formatter.formatOptions = [.withInternetDateTime]
            if let date = formatter.date(from: dateString) {
                return date
            }

            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Cannot decode date: \(dateString)"
            )
        }

        self.encoder = JSONEncoder()
        self.encoder.dateEncodingStrategy = .iso8601

        NetworkLogger.log(.info, "🚀 NetworkManager initialized with base URL: \(baseURL)")
    }

    func request<T: Decodable>(_ endpoint: APIEndpoint) async throws -> T {
        let (request, bodyData) = try await buildRequest(for: endpoint)

        NetworkLogger.logRequest(request, body: bodyData)

        let startTime = Date()
        let data: Data
        let response: URLResponse

        do {
            (data, response) = try await session.data(for: request)
        } catch let error as NSError where error.code == NSURLErrorCancelled {
            // Don't log cancellation errors - these are expected during pull-to-refresh
            throw NetworkError.cancelled
        } catch {
            NetworkLogger.logError(error, url: request.url?.absoluteString)
            throw NetworkError.networkError(error)
        }

        let duration = Date().timeIntervalSince(startTime)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.unknown
        }

        NetworkLogger.logResponse(httpResponse, data: data, duration: duration)

        switch httpResponse.statusCode {
        case 200...299:
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                NetworkLogger.log(.error, "Decoding error: \(error)")
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

    private func buildRequest(for endpoint: APIEndpoint) async throws -> (URLRequest, Data?) {
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
        var bodyData: Data?
        if let body = endpoint.body {
            bodyData = try encoder.encode(AnyEncodable(body))
            request.httpBody = bodyData
        }

        return (request, bodyData)
    }
}

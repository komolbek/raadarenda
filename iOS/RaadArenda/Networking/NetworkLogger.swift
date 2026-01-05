import Foundation
import os.log

enum NetworkLogLevel: String {
    case debug = "DEBUG"
    case info = "INFO"
    case warning = "WARNING"
    case error = "ERROR"
}

struct NetworkLogger {
    static var isEnabled: Bool = true

    private static let logger = Logger(subsystem: Bundle.main.bundleIdentifier ?? "RaadArenda", category: "Network")

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm:ss.SSS"
        return formatter
    }()

    static func log(_ level: NetworkLogLevel, _ message: String) {
        guard isEnabled else { return }
        let timestamp = dateFormatter.string(from: Date())
        let emoji: String
        switch level {
        case .debug: emoji = "🔍"
        case .info: emoji = "ℹ️"
        case .warning: emoji = "⚠️"
        case .error: emoji = "❌"
        }
        let logMessage = "[\(timestamp)] \(emoji) [\(level.rawValue)] \(message)"
        logger.log("\(logMessage)")
        print(logMessage)
    }

    static func logRequest(_ request: URLRequest, body: Data?) {
        guard isEnabled else { return }

        let separator = String(repeating: "─", count: 60)
        print("\n\(separator)")
        log(.info, "➡️ REQUEST: \(request.httpMethod ?? "?") \(request.url?.absoluteString ?? "?")")

        // Log headers
        if let headers = request.allHTTPHeaderFields, !headers.isEmpty {
            log(.debug, "📋 Headers:")
            for (key, value) in headers.sorted(by: { $0.key < $1.key }) {
                let displayValue = key.lowercased().contains("auth") ? "[REDACTED]" : value
                print("   • \(key): \(displayValue)")
            }
        }

        // Log body
        if let body = body, let jsonString = prettyPrintJSON(body) {
            log(.debug, "📤 Body:")
            print(jsonString.split(separator: "\n").map { "   \($0)" }.joined(separator: "\n"))
        }
    }

    static func logResponse(_ response: HTTPURLResponse, data: Data, duration: TimeInterval) {
        guard isEnabled else { return }

        let statusEmoji = (200...299).contains(response.statusCode) ? "✅" : "❌"
        let level: NetworkLogLevel = (200...299).contains(response.statusCode) ? .info : .error

        log(level, "\(statusEmoji) RESPONSE: \(response.statusCode) (\(String(format: "%.2f", duration * 1000))ms)")
        log(.debug, "📍 URL: \(response.url?.absoluteString ?? "?")")

        // Log response body (truncated for large responses)
        if let jsonString = prettyPrintJSON(data) {
            let truncated = jsonString.count > 2000
            let displayString = truncated ? String(jsonString.prefix(2000)) + "\n... (truncated)" : jsonString
            log(.debug, "📥 Response Body:")
            print(displayString.split(separator: "\n").map { "   \($0)" }.joined(separator: "\n"))
        }

        let separator = String(repeating: "─", count: 60)
        print(separator + "\n")
    }

    static func logError(_ error: Error, url: String?) {
        guard isEnabled else { return }
        log(.error, "🚨 Network Error: \(error.localizedDescription)")
        if let url = url {
            log(.error, "📍 URL: \(url)")
        }
    }

    private static func prettyPrintJSON(_ data: Data) -> String? {
        guard let object = try? JSONSerialization.jsonObject(with: data),
              let prettyData = try? JSONSerialization.data(withJSONObject: object, options: .prettyPrinted),
              let prettyString = String(data: prettyData, encoding: .utf8) else {
            return String(data: data, encoding: .utf8)
        }
        return prettyString
    }
}

import Foundation

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

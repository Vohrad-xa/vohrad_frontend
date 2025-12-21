import SwiftUI
import ExpoModulesCore

// MARK: - SubmitLabel

internal enum SubmitLabel: String, Enumerable {
  case done = "done"
  case go = "go"
  case send = "send"
  case search = "search"
  case next = "next"
  case `continue` = "continue"
  case `return` = "return"

  func toSwiftUI() -> SwiftUI.SubmitLabel {
    switch self {
    case .done: return .done
    case .go: return .go
    case .send: return .send
    case .search: return .search
    case .next: return .next
    case .continue: return .continue
    case .return: return .return
    }
  }
}

import ExpoModulesCore
import SwiftUI

// MARK: - List Style Modifier (Internal)

internal struct ListStyleModifier: ViewModifier {
  let style: ListStyleType

  @ViewBuilder
  func body(content: Content) -> some View {
    switch style {
    case .grouped:
      content.listStyle(.grouped)
    case .insetGrouped:
      #if !os(tvOS)
        content.listStyle(.insetGrouped)
      #else
        content.listStyle(.grouped)
      #endif
    case .inset:
      #if !os(tvOS)
        content.listStyle(.inset)
      #else
        content.listStyle(.plain)
      #endif
    case .plain:
      content.listStyle(.plain)
    case .sidebar:
      #if !os(tvOS)
        content.listStyle(.sidebar)
      #else
        content.listStyle(.grouped)
      #endif
    case .automatic:
      content.listStyle(.automatic)
    }
  }
}

// MARK: - Swipe Actions Modifier (Internal)

internal struct ListSwipeActionsModifier: ViewModifier {
  let edge: HorizontalEdge
  let config: SwipeActionsConfig?
  let onAction: (String, String) -> Void

  @ViewBuilder
  func body(content: Content) -> some View {
    if #available(iOS 15.0, *), let config = config, !config.actions.isEmpty {
      content.swipeActions(edge: edge, allowsFullSwipe: config.allowsFullSwipe) {
        ForEach(config.actions, id: \.id) { action in
          SwiftUI.Button(role: action.role.toNativeRole()) {
            onAction(action.id, action.label)
          } label: {
            if let systemImage = action.systemImage, !systemImage.isEmpty {
              Label(action.label, systemImage: systemImage)
            } else {
              Text(action.label)
            }
          }
          .tint(action.tint)
        }
      }
    } else {
      content
    }
  }
}

// MARK: - Selection Helpers

internal extension AnyHashable {
  /// Convert AnyHashable to JSON-serializable type
  var jsonValue: Any? {
    if let stringValue = base as? String {
      return stringValue
    } else if let intValue = base as? Int {
      return intValue
    } else if let doubleValue = base as? Double {
      return doubleValue
    }
    return nil
  }
}

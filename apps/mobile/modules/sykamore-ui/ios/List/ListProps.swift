import ExpoModulesCore
import SwiftUI

// MARK: - Selection

/// Selection behavior for the list
internal enum SelectionMode: String, Enumerable {
  case multiple
  case single
  case none
}

// MARK: - Swipe Actions

/// Button role for swipe actions
internal enum SwipeActionRole: String, Enumerable {
  case `default`
  case destructive
  case cancel

  func toNativeRole() -> SwiftUI.ButtonRole? {
    switch self {
    case .default:
      return nil
    case .destructive:
      return .destructive
    case .cancel:
      return .cancel
    }
  }
}

/// Single swipe action configuration
internal struct SwipeActionConfig: Record {
  @Field var id: String = ""
  @Field var label: String = ""
  @Field var systemImage: String?
  @Field var role: SwipeActionRole = .default
  @Field var tint: Color?
}

/// Swipe actions configuration for an edge
internal struct SwipeActionsConfig: Record {
  @Field var actions: [SwipeActionConfig] = []
  @Field var allowsFullSwipe: Bool = true
}

// MARK: - List Style

/// Available list styles matching SwiftUI's ListStyle
internal enum ListStyleType: String, Enumerable {
  case automatic
  case plain
  case grouped
  case insetGrouped
  case inset
  case sidebar
}

// MARK: - List Props

final class ListProps: UIBaseViewProps {
  // MARK: Style
  @Field var listStyle: ListStyleType = .automatic

  // MARK: Selection
  @Field var selectEnabled: Bool = true
  @Field var selectionMode: SelectionMode = .multiple
  @Field var selection: [Either<String, Double>]?

  // MARK: Editing
  @Field var moveEnabled: Bool = false
  @Field var deleteEnabled: Bool = false
  @Field var editModeEnabled: Bool = false

  // MARK: Scroll
  @Field var scrollEnabled: Bool = true

  // MARK: Refresh
  @Field var refreshEnabled: Bool = false
  @Field var refreshing: Bool = false

  // MARK: Swipe Actions
  @Field var leadingSwipeActions: SwipeActionsConfig?
  @Field var trailingSwipeActions: SwipeActionsConfig?

  // MARK: Events
  var onDeleteItem = EventDispatcher()
  var onMoveItem = EventDispatcher()
  var onSelectionChange = EventDispatcher()
  var onSwipeAction = EventDispatcher()
  var onRefresh = EventDispatcher()
}
